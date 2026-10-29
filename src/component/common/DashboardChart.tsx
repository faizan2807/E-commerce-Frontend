import React, { useState, useMemo, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Card,
  CardBody,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Badge,
  useColorModeValue,
  Skeleton,
} from "@chakra-ui/react";
import {
  ChevronDown,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
} from "lucide-react";

export interface ChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
  date?: string;
}

export type RangeOption = "7d" | "15d" | "30d" | "6m" | "1y" | "all";

interface DashboardChartProps {
  data: ChartDataPoint[];
  selectedRange: RangeOption;
  onRangeChange: (range: RangeOption) => void;
  isLoading?: boolean;
}

const RANGE_LABELS: Record<RangeOption, string> = {
  "7d": "Last 7 Days",
  "15d": "Last 15 Days",
  "30d": "Last 30 Days",
  "6m": "Last 6 Months",
  "1y": "Last 1 Year",
  "all": "All Time Overview",
};

// Generates smooth cubic bezier curves between points
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

export default function DashboardChart({
  data,
  selectedRange,
  onRangeChange,
  isLoading = false,
}: DashboardChartProps) {
  const [activeMetric, setActiveMetric] = useState<"both" | "revenue" | "orders">("both");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Theme-aware tokens
  const cardBg = useColorModeValue("white", "#111C44");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const gridLineColor = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)");
  const axisTextColor = useColorModeValue("#64748B", "#94A3B8");
  const dropdownBg = useColorModeValue("#F8FAFC", "#162044");
  const dropdownBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.12)");
  const menuListBg = useColorModeValue("white", "#111C44");

  // Chart dimensions in SVG coordinates
  const svgWidth = 850;
  const svgHeight = 290;
  const pad = { top: 25, right: 35, bottom: 45, left: 65 };
  const chartW = svgWidth - pad.left - pad.right;
  const chartH = svgHeight - pad.top - pad.bottom;
  const baselineY = pad.top + chartH;

  // Aggregate metrics for summary
  const summary = useMemo(() => {
    const totalRev = data.reduce((acc, d) => acc + (d.revenue || 0), 0);
    const totalOrd = data.reduce((acc, d) => acc + (d.orders || 0), 0);
    const avgOrderVal = totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;
    return { totalRev, totalOrd, avgOrderVal };
  }, [data]);

  // Max values for scaling
  const maxRevenue = useMemo(() => {
    const max = Math.max(...data.map((d) => d.revenue || 0), 0);
    return max > 0 ? max * 1.15 : 10000;
  }, [data]);

  const maxOrders = useMemo(() => {
    const max = Math.max(...data.map((d) => d.orders || 0), 0);
    return max > 0 ? Math.ceil(max * 1.2) : 10;
  }, [data]);

  // Map data into SVG coordinate points
  const points = useMemo(() => {
    if (data.length === 0) return [];
    const step = data.length > 1 ? chartW / (data.length - 1) : chartW / 2;

    return data.map((d, i) => {
      const x = pad.left + (data.length > 1 ? i * step : chartW / 2);
      const revRatio = Math.min(1, Math.max(0, (d.revenue || 0) / maxRevenue));
      const ordRatio = Math.min(1, Math.max(0, (d.orders || 0) / maxOrders));
      const yRev = baselineY - revRatio * chartH;
      const yOrd = baselineY - ordRatio * chartH;

      return {
        ...d,
        x,
        yRev,
        yOrd,
      };
    });
  }, [data, chartW, chartH, baselineY, pad.left, maxRevenue, maxOrders]);

  // Revenue Paths
  const revenueLinePath = useMemo(() => {
    return generateSmoothPath(points.map((p) => ({ x: p.x, y: p.yRev })));
  }, [points]);

  const revenueAreaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${revenueLinePath} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
  }, [revenueLinePath, points, baselineY]);

  // Orders Paths
  const ordersLinePath = useMemo(() => {
    return generateSmoothPath(points.map((p) => ({ x: p.x, y: p.yOrd })));
  }, [points]);

  const ordersAreaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${ordersLinePath} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
  }, [ordersLinePath, points, baselineY]);

  // Horizontal Grid Ticks (4 intervals)
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  // Mouse hover interaction
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <Card
      bg={cardBg}
      borderRadius="2xl"
      boxShadow="0 10px 25px rgba(0,0,0,0.05)"
      border="1px solid"
      borderColor={cardBorder}
      overflow="hidden"
      mb={6}
    >
      <CardBody p={{ base: 4, sm: 6 }}>
        {/* Top Header & Range Controls */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
          mb={6}
        >
          {/* Title & Highlights */}
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <TrendingUp size={20} color="#6366F1" />
              <Heading size="md" color={textColor}>
                Sales & Performance Analytics
              </Heading>
            </Flex>
            <Text fontSize="xs" color={subTextColor}>
              Visualizing revenue generation and order volume over time
            </Text>
          </Box>

          {/* Metric Selector & Range Dropdown */}
          <Flex align="center" gap={3} flexWrap="wrap" w={{ base: "100%", md: "auto" }}>
            {/* Metric Filter Tabs */}
            <HStack spacing={1} bg={dropdownBg} p={1} borderRadius="lg" border="1px solid" borderColor={dropdownBorder}>
              <Button
                size="xs"
                variant={activeMetric === "both" ? "solid" : "ghost"}
                colorScheme={activeMetric === "both" ? "indigo" : "gray"}
                bg={activeMetric === "both" ? "#6366F1" : "transparent"}
                color={activeMetric === "both" ? "white" : subTextColor}
                borderRadius="md"
                onClick={() => setActiveMetric("both")}
                _hover={{ opacity: 0.9 }}
              >
                All
              </Button>
              <Button
                size="xs"
                variant={activeMetric === "revenue" ? "solid" : "ghost"}
                bg={activeMetric === "revenue" ? "#6366F1" : "transparent"}
                color={activeMetric === "revenue" ? "white" : subTextColor}
                borderRadius="md"
                onClick={() => setActiveMetric("revenue")}
                _hover={{ opacity: 0.9 }}
              >
                Revenue
              </Button>
              <Button
                size="xs"
                variant={activeMetric === "orders" ? "solid" : "ghost"}
                bg={activeMetric === "orders" ? "#06B6D4" : "transparent"}
                color={activeMetric === "orders" ? "white" : subTextColor}
                borderRadius="md"
                onClick={() => setActiveMetric("orders")}
                _hover={{ opacity: 0.9 }}
              >
                Orders
              </Button>
            </HStack>

            {/* Range Dropdown */}
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                rightIcon={<ChevronDown size={14} />}
                leftIcon={<Calendar size={14} color="#6366F1" />}
                bg={dropdownBg}
                color={textColor}
                border="1px solid"
                borderColor={dropdownBorder}
                borderRadius="xl"
                fontSize="xs"
                fontWeight="600"
                px={3}
                _hover={{ borderColor: "#6366F1" }}
                _active={{ bg: dropdownBg }}
              >
                {RANGE_LABELS[selectedRange]}
              </MenuButton>
              <MenuList
                bg={menuListBg}
                borderColor={dropdownBorder}
                boxShadow="0 10px 25px rgba(0,0,0,0.15)"
                borderRadius="xl"
                p={1.5}
                zIndex={20}
              >
                {(Object.keys(RANGE_LABELS) as RangeOption[]).map((key) => (
                  <MenuItem
                    key={key}
                    onClick={() => onRangeChange(key)}
                    borderRadius="lg"
                    fontSize="xs"
                    fontWeight={selectedRange === key ? "700" : "500"}
                    color={selectedRange === key ? "#6366F1" : textColor}
                    bg={selectedRange === key ? useColorModeValue("indigo.50", "rgba(99,102,241,0.12)") : "transparent"}
                    _hover={{
                      bg: useColorModeValue("gray.100", "rgba(255,255,255,0.06)"),
                    }}
                  >
                    <Flex justify="space-between" align="center" w="100%">
                      <Text>{RANGE_LABELS[key]}</Text>
                      {selectedRange === key && (
                        <Badge colorScheme="purple" fontSize="9px" borderRadius="full" px={1.5}>
                          Active
                        </Badge>
                      )}
                    </Flex>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {/* Quick Highlights Strip */}
        <Flex
          gap={4}
          mb={4}
          flexWrap="wrap"
          p={3}
          bg={useColorModeValue("gray.50", "rgba(255,255,255,0.03)")}
          borderRadius="xl"
          border="1px solid"
          borderColor={dropdownBorder}
        >
          <Flex align="center" gap={2}>
            <Flex w="30px" h="30px" borderRadius="lg" bg="rgba(99, 102, 241, 0.12)" align="center" justify="center">
              <DollarSign size={16} color="#6366F1" />
            </Flex>
            <Box>
              <Text fontSize="10px" color={subTextColor} textTransform="uppercase" fontWeight="600">
                Period Revenue
              </Text>
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                ₹{summary.totalRev.toLocaleString()}
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap={2}>
            <Flex w="30px" h="30px" borderRadius="lg" bg="rgba(6, 182, 212, 0.12)" align="center" justify="center">
              <ShoppingBag size={16} color="#06B6D4" />
            </Flex>
            <Box>
              <Text fontSize="10px" color={subTextColor} textTransform="uppercase" fontWeight="600">
                Period Orders
              </Text>
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                {summary.totalOrd} Orders
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap={2}>
            <Flex w="30px" h="30px" borderRadius="lg" bg="rgba(16, 185, 129, 0.12)" align="center" justify="center">
              <TrendingUp size={16} color="#10B981" />
            </Flex>
            <Box>
              <Text fontSize="10px" color={subTextColor} textTransform="uppercase" fontWeight="600">
                Avg Order Value
              </Text>
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                ₹{summary.avgOrderVal.toLocaleString()}
              </Text>
            </Box>
          </Flex>
        </Flex>

        {/* Chart SVG Canvas */}
        {isLoading ? (
          <Skeleton height="280px" borderRadius="xl" />
        ) : points.length === 0 ? (
          <Flex h="280px" justify="center" align="center" direction="column" gap={2}>
            <Calendar size={32} color={subTextColor} />
            <Text fontSize="sm" color={subTextColor}>
              No analytics data found for {RANGE_LABELS[selectedRange]}.
            </Text>
          </Flex>
        ) : (
          <Box position="relative" w="100%" h="290px" userSelect="none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              width="100%"
              height="100%"
              style={{ overflow: "visible" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                {/* Revenue Gradient Fill */}
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.45" />
                  <stop offset="90%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>

                {/* Orders Gradient Fill */}
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                  <stop offset="90%" stopColor="#06B6D4" stopOpacity="0.0" />
                </linearGradient>

                {/* Drop shadow filter for lines */}
                <filter id="glowRevenue" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.3" />
                </filter>
                <filter id="glowOrders" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#06B6D4" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Grid Lines & Y Axis Labels */}
              {yTicks.map((tickRatio, idx) => {
                const y = baselineY - tickRatio * chartH;
                const revVal = Math.round(tickRatio * maxRevenue);
                return (
                  <g key={idx}>
                    <line
                      x1={pad.left}
                      y1={y}
                      x2={svgWidth - pad.right}
                      y2={y}
                      stroke={gridLineColor}
                      strokeDasharray={idx === 0 ? "none" : "4 4"}
                      strokeWidth={1}
                    />
                    <text
                      x={pad.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill={axisTextColor}
                      fontFamily="inherit"
                    >
                      {revVal >= 100000
                        ? `₹${(revVal / 100000).toFixed(1)}L`
                        : revVal >= 1000
                        ? `₹${(revVal / 1000).toFixed(0)}k`
                        : `₹${revVal}`}
                    </text>
                  </g>
                );
              })}

              {/* Area & Stroke: Revenue */}
              {(activeMetric === "both" || activeMetric === "revenue") && (
                <>
                  <path d={revenueAreaPath} fill="url(#revenueGrad)" />
                  <path
                    d={revenueLinePath}
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glowRevenue)"
                  />
                </>
              )}

              {/* Area & Stroke: Orders */}
              {(activeMetric === "both" || activeMetric === "orders") && (
                <>
                  <path d={ordersAreaPath} fill="url(#ordersGrad)" />
                  <path
                    d={ordersLinePath}
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={activeMetric === "both" ? "5 4" : "none"}
                    filter="url(#glowOrders)"
                  />
                </>
              )}

              {/* X Axis Labels */}
              {points.map((p, idx) => {
                // If there are many points, show labels at intervals to avoid overlap
                const showLabel = points.length <= 8 || idx % Math.ceil(points.length / 7) === 0 || idx === points.length - 1;
                if (!showLabel) return null;

                return (
                  <text
                    key={idx}
                    x={p.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill={axisTextColor}
                    fontFamily="inherit"
                  >
                    {p.label}
                  </text>
                );
              })}

              {/* Hover Crosshair & Dots */}
              {hoveredPoint && (
                <g>
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={hoveredPoint.x}
                    y1={pad.top}
                    x2={hoveredPoint.x}
                    y2={baselineY}
                    stroke="#818CF8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />

                  {/* Revenue Point Dot */}
                  {(activeMetric === "both" || activeMetric === "revenue") && (
                    <g>
                      <circle cx={hoveredPoint.x} cy={hoveredPoint.yRev} r="7" fill="#6366F1" opacity="0.3" />
                      <circle cx={hoveredPoint.x} cy={hoveredPoint.yRev} r="4.5" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2.5" />
                    </g>
                  )}

                  {/* Orders Point Dot */}
                  {(activeMetric === "both" || activeMetric === "orders") && (
                    <g>
                      <circle cx={hoveredPoint.x} cy={hoveredPoint.yOrd} r="6" fill="#06B6D4" opacity="0.3" />
                      <circle cx={hoveredPoint.x} cy={hoveredPoint.yOrd} r="4" fill="#FFFFFF" stroke="#06B6D4" strokeWidth="2.5" />
                    </g>
                  )}
                </g>
              )}
            </svg>

            {/* Floating Glassmorphic Tooltip */}
            {hoveredPoint && (
              <Box
                position="absolute"
                top="15px"
                left={`${Math.min(
                  Math.max(10, (hoveredPoint.x / svgWidth) * 100 - 10),
                  78
                )}%`}
                pointerEvents="none"
                bg={useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(17, 28, 68, 0.95)")}
                backdropFilter="blur(8px)"
                border="1px solid"
                borderColor={dropdownBorder}
                boxShadow="0 10px 25px rgba(0,0,0,0.2)"
                borderRadius="xl"
                p={3}
                zIndex={10}
                minW="150px"
                transition="all 0.15s ease-out"
              >
                <Text fontSize="xs" fontWeight="700" color={textColor} mb={1}>
                  {hoveredPoint.date || hoveredPoint.label}
                </Text>
                <Flex align="center" justify="space-between" gap={3}>
                  <Flex align="center" gap={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg="#6366F1" />
                    <Text fontSize="xs" color={subTextColor}>Revenue:</Text>
                  </Flex>
                  <Text fontSize="xs" fontWeight="700" color="#6366F1">
                    ₹{hoveredPoint.revenue.toLocaleString()}
                  </Text>
                </Flex>
                <Flex align="center" justify="space-between" gap={3} mt={1}>
                  <Flex align="center" gap={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg="#06B6D4" />
                    <Text fontSize="xs" color={subTextColor}>Orders:</Text>
                  </Flex>
                  <Text fontSize="xs" fontWeight="700" color="#06B6D4">
                    {hoveredPoint.orders}
                  </Text>
                </Flex>
              </Box>
            )}
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
