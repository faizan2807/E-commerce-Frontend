import { useState, useMemo, useEffect } from "react";
import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Button,
    Badge,
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    Collapse,
    useDisclosure,
    Checkbox,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

export interface FilterState {
    brand: string;
    priceRange: string;
    sortBy: string;
}

interface FilterNavbarProps {
    availableBrands: string[];
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onReset: () => void;
    totalCount: number;
    categoryTitle?: string;
}

export const PRICE_RANGES = [
    { label: "All", value: "all" },
    { label: "Under ₹1K", value: "0-1000" },
    { label: "₹1K - ₹5K", value: "1000-5000" },
    { label: "₹5K - ₹15K", value: "5000-15000" },
    { label: "₹15K - ₹50K", value: "15000-50000" },
    { label: "Above ₹50K", value: "50000-above" },
];

export const SORT_OPTIONS = [
    { label: "Popularity", value: "default" },
    { label: "Price -- Low to High", value: "price-asc" },
    { label: "Price -- High to Low", value: "price-desc" },
    { label: "Customer Rating", value: "rating-desc" },
];

const MAX_SLIDER_PRICE = 80000;

export default function FilterNavbar({
    availableBrands,
    filters,
    onFilterChange,
    onReset,
    totalCount,
    categoryTitle,
}: FilterNavbarProps) {
    const { isOpen: isMobileOpen, onToggle: onMobileToggle } = useDisclosure({ defaultIsOpen: true });
    const [brandSearch] = useState("");

    // Theme-adaptive colors
    const containerBg = useColorModeValue("white", "gray.800");
    const containerBorder = useColorModeValue("gray.200", "gray.700");
    const dividerColor = useColorModeValue("gray.100", "gray.700");
    const headerTitleColor = useColorModeValue("gray.800", "white");
    const sectionTitleColor = useColorModeValue("gray.600", "gray.400");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const countTextColor = useColorModeValue("gray.400", "gray.500");
    const primaryTextColor = useColorModeValue("gray.800", "gray.100");
    const brandCheckedColor = useColorModeValue("gray.900", "white");
    const brandUncheckedColor = useColorModeValue("gray.600", "gray.300");
    const headerBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const pillBg = useColorModeValue("gray.50", "gray.700");
    const pillBorder = useColorModeValue("gray.200", "gray.600");
    const sliderTrackBg = useColorModeValue("gray.200", "gray.700");
    const sliderThumbBg = useColorModeValue("white", "gray.800");
    const sortSelectedBg = useColorModeValue("red.50", "rgba(229, 62, 62, 0.18)");
    const sortHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
    const sortTextColor = useColorModeValue("gray.700", "gray.300");
    const sortSelectedTextColor = useColorModeValue("red.600", "red.300");
    const priceRangeTextColor = useColorModeValue("red.600", "red.400");
    const clearAllColor = useColorModeValue("blue.600", "blue.300");
    const clearAllHoverColor = useColorModeValue("blue.700", "blue.200");
    const scrollbarThumbColor = useColorModeValue("gray.300", "gray.600");
    const containerShadow = useColorModeValue(
        "0 1px 4px 0 rgba(0, 0, 0, 0.08)",
        "0 4px 20px 0 rgba(0, 0, 0, 0.35)"
    );

    // Parse current min and max from filters.priceRange
    const currentSliderValues = useMemo<[number, number]>(() => {
        if (!filters.priceRange || filters.priceRange === "all") {
            return [0, MAX_SLIDER_PRICE];
        }
        const [minStr, maxStr] = filters.priceRange.split("-");
        const min = Number(minStr) || 0;
        const max = maxStr === "above" ? MAX_SLIDER_PRICE : Number(maxStr) || MAX_SLIDER_PRICE;
        return [min, max];
    }, [filters.priceRange]);

    const [sliderValue, setSliderValue] = useState<[number, number]>(currentSliderValues);

    useEffect(() => {
        setSliderValue(currentSliderValues);
    }, [currentSliderValues]);

    const hasActiveFilters =
        Boolean(filters.brand && filters.brand !== "all") ||
        Boolean(filters.priceRange && filters.priceRange !== "all") ||
        Boolean(filters.sortBy && filters.sortBy !== "default");

    // Filter brands by search keyword
    const filteredBrandsList = useMemo(() => {
        if (!brandSearch.trim()) return availableBrands;
        return availableBrands.filter((b) =>
            b.toLowerCase().includes(brandSearch.trim().toLowerCase())
        );
    }, [availableBrands, brandSearch]);

    const handleSliderChangeEnd = (val: number[]) => {
        const [min, max] = val;
        if (min === 0 && max === MAX_SLIDER_PRICE) {
            onFilterChange({ ...filters, priceRange: "all" });
        } else {
            onFilterChange({ ...filters, priceRange: `${min}-${max}` });
        }
    };

    const handlePresetClick = (presetValue: string) => {
        onFilterChange({ ...filters, priceRange: presetValue });
    };

    return (
        <Box
            w={{ base: "100%", lg: "300px" }}
            maxW={{ base: "100%", lg: "300px" }}
            float={{ base: "none", lg: "left" }}
            mr={{ base: 0, lg: 5 }}
            mb={{ base: 4, lg: 6 }}
            bg={containerBg}
            borderRadius="md"
            border="1px solid"
            borderColor={containerBorder}
            boxShadow={containerShadow}
            fontSize="xs"
            position={{ lg: "sticky" }}
            top={{ lg: "85px" }}
            zIndex={9}
            userSelect="none"
            transition="background-color 0.2s, border-color 0.2s"
        >
            {/* Top Bar */}
            <Flex
                align="center"
                justify="space-between"
                px={3.5}
                py={3}
                borderBottom="1px solid"
                borderColor={dividerColor}
            >
                <HStack spacing={2}>
                    <SlidersHorizontal size={14} color="#2874f0" />
                    <Text fontWeight="bold" fontSize="sm" color={headerTitleColor} letterSpacing="0.2px">
                        Filters
                    </Text>
                    <Badge colorScheme="blue" fontSize="2xs" borderRadius="full" px={1.5}>
                        {totalCount}
                    </Badge>
                </HStack>

                <HStack spacing={2}>
                    {hasActiveFilters && (
                        <Text
                            as="button"
                            fontSize="2xs"
                            fontWeight="bold"
                            color={clearAllColor}
                            textTransform="uppercase"
                            letterSpacing="0.5px"
                            cursor="pointer"
                            _hover={{ textDecoration: "underline", color: clearAllHoverColor }}
                            onClick={onReset}
                        >
                            Clear All
                        </Text>
                    )}
                    <Button
                        size="xs"
                        variant="ghost"
                        display={{ base: "inline-flex", lg: "none" }}
                        onClick={onMobileToggle}
                        p={1}
                        h="auto"
                    >
                        {isMobileOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </Button>
                </HStack>
            </Flex>

            {/* Category Breadcrumb/Header */}
            {categoryTitle && (
                <Box px={3.5} py={2} bg={headerBg} borderBottom="1px solid" borderColor={dividerColor}>
                    <Text fontSize="2xs" color={subTextColor} textTransform="uppercase" fontWeight="bold">
                        Category
                    </Text>
                    <Text fontSize="xs" fontWeight="semibold" color={headerTitleColor} noOfLines={1}>
                        {categoryTitle}
                    </Text>
                </Box>
            )}

            <Collapse in={isMobileOpen} animateOpacity>
                <VStack spacing={0} align="stretch">
                    {/* SECTION 1: PRICE RANGE SLIDER (Flipkart style) */}
                    <Box px={3.5} py={3} borderBottom="1px solid" borderColor={dividerColor}>
                        <Flex justify="space-between" align="center" mb={1.5}>
                            <Text fontSize="2xs" fontWeight="bold" color={sectionTitleColor} textTransform="uppercase" letterSpacing="0.5px">
                                Price
                            </Text>
                            <Text fontSize="2xs" fontWeight="bold" color={priceRangeTextColor}>
                                ₹{sliderValue[0].toLocaleString("en-IN")} - ₹{sliderValue[1] >= MAX_SLIDER_PRICE ? "80K+" : sliderValue[1].toLocaleString("en-IN")}
                            </Text>
                        </Flex>

                        {/* Interactive Range Slider */}
                        <Box px={1.5} py={2.5}>
                            <RangeSlider
                                aria-label={["min price", "max price"]}
                                colorScheme="red"
                                min={0}
                                max={MAX_SLIDER_PRICE}
                                step={500}
                                value={sliderValue}
                                onChange={(val) => setSliderValue([val[0], val[1]])}
                                onChangeEnd={handleSliderChangeEnd}
                            >
                                <RangeSliderTrack bg={sliderTrackBg} h="4px" borderRadius="full">
                                    <RangeSliderFilledTrack bg="red.500" />
                                </RangeSliderTrack>
                                <RangeSliderThumb
                                    index={0}
                                    boxSize={3.5}
                                    bg={sliderThumbBg}
                                    border="2px solid"
                                    borderColor="red.500"
                                    boxShadow="sm"
                                    _focus={{ boxShadow: "0 0 0 2px rgba(229, 62, 62, 0.4)" }}
                                />
                                <RangeSliderThumb
                                    index={1}
                                    boxSize={3.5}
                                    bg={sliderThumbBg}
                                    border="2px solid"
                                    borderColor="red.500"
                                    boxShadow="sm"
                                    _focus={{ boxShadow: "0 0 0 2px rgba(229, 62, 62, 0.4)" }}
                                />
                            </RangeSlider>
                        </Box>

                        {/* Min / Max Indicator Pills */}
                        <Flex justify="space-between" align="center" gap={1.5} mb={2.5}>
                            <Box
                                flex="1"
                                px={2}
                                py={1}
                                border="1px solid"
                                borderColor={pillBorder}
                                borderRadius="sm"
                                bg={pillBg}
                                textAlign="center"
                            >
                                <Text fontSize="3xs" color={countTextColor} lineHeight="1">Min</Text>
                                <Text fontSize="2xs" fontWeight="bold" color={primaryTextColor}>
                                    ₹{sliderValue[0].toLocaleString("en-IN")}
                                </Text>
                            </Box>
                            <Text fontSize="2xs" color={countTextColor}>to</Text>
                            <Box
                                flex="1"
                                px={2}
                                py={1}
                                border="1px solid"
                                borderColor={pillBorder}
                                borderRadius="sm"
                                bg={pillBg}
                                textAlign="center"
                            >
                                <Text fontSize="3xs" color={countTextColor} lineHeight="1">Max</Text>
                                <Text fontSize="2xs" fontWeight="bold" color={primaryTextColor}>
                                    ₹{sliderValue[1] >= MAX_SLIDER_PRICE ? "80,000+" : sliderValue[1].toLocaleString("en-IN")}
                                </Text>
                            </Box>
                        </Flex>

                        {/* Quick Presets */}
                        <Flex wrap="wrap" gap={1}>
                            {PRICE_RANGES.map((preset) => {
                                const isSelected = filters.priceRange === preset.value;
                                return (
                                    <Button
                                        key={preset.value}
                                        size="2xs"
                                        fontSize="3xs"
                                        h="20px"
                                        px={1.5}
                                        borderRadius="xs"
                                        variant={isSelected ? "solid" : "outline"}
                                        colorScheme="red"
                                        onClick={() => handlePresetClick(preset.value)}
                                    >
                                        {preset.label}
                                    </Button>
                                );
                            })}
                        </Flex>
                    </Box>

                    {/* SECTION 2: BRAND FILTER (Flipkart-style checkboxes) */}
                    <Box px={3.5} py={3} borderBottom="1px solid" borderColor={dividerColor}>
                        <Flex justify="space-between" align="center" mb={1.5}>
                            <Text fontSize="2xs" fontWeight="bold" color={sectionTitleColor} textTransform="uppercase" letterSpacing="0.5px">
                                Brand
                            </Text>
                            <Text fontSize="3xs" color={countTextColor}>
                                {availableBrands.length} Brands
                            </Text>
                        </Flex>

                        {/* Brand Checkbox List */}
                        <VStack
                            align="stretch"
                            spacing={1}
                            maxH="130px"
                            overflowY="auto"
                            pr={1}
                            sx={{
                                "&::-webkit-scrollbar": { width: "3px" },
                                "&::-webkit-scrollbar-thumb": { bg: scrollbarThumbColor, borderRadius: "full" },
                            }}
                        >
                            {/* All Brands Checkbox */}
                            <Checkbox
                                size="sm"
                                colorScheme="red"
                                isChecked={!filters.brand || filters.brand === "all"}
                                onChange={() => onFilterChange({ ...filters, brand: "all" })}
                            >
                                <Text
                                    fontSize="xs"
                                    color={!filters.brand || filters.brand === "all" ? brandCheckedColor : brandUncheckedColor}
                                    fontWeight={!filters.brand || filters.brand === "all" ? "bold" : "normal"}
                                >
                                    All Brands
                                </Text>
                            </Checkbox>

                            {filteredBrandsList.map((brandName) => {
                                const isChecked = filters.brand?.toLowerCase() === brandName.toLowerCase();
                                return (
                                    <Checkbox
                                        key={brandName}
                                        size="sm"
                                        colorScheme="red"
                                        isChecked={isChecked}
                                        onChange={() =>
                                            onFilterChange({
                                                ...filters,
                                                brand: isChecked ? "all" : brandName,
                                            })
                                        }
                                    >
                                        <Text
                                            fontSize="xs"
                                            color={isChecked ? brandCheckedColor : brandUncheckedColor}
                                            fontWeight={isChecked ? "bold" : "normal"}
                                            noOfLines={1}
                                        >
                                            {brandName}
                                        </Text>
                                    </Checkbox>
                                );
                            })}
                        </VStack>
                    </Box>

                    {/* SECTION 3: SORT (Flipkart style) */}
                    <Box px={3.5} py={3}>
                        <Text fontSize="2xs" fontWeight="bold" color={sectionTitleColor} textTransform="uppercase" letterSpacing="0.5px" mb={1.5}>
                            Sort By
                        </Text>
                        <VStack align="stretch" spacing={1}>
                            {SORT_OPTIONS.map((sortOption) => {
                                const isSelected =
                                    (!filters.sortBy && sortOption.value === "default") ||
                                    filters.sortBy === sortOption.value;

                                return (
                                    <Flex
                                        key={sortOption.value}
                                        align="center"
                                        justify="space-between"
                                        px={2}
                                        py={1}
                                        borderRadius="sm"
                                        cursor="pointer"
                                        bg={isSelected ? sortSelectedBg : "transparent"}
                                        color={isSelected ? sortSelectedTextColor : sortTextColor}
                                        fontWeight={isSelected ? "bold" : "normal"}
                                        fontSize="2xs"
                                        _hover={{ bg: isSelected ? sortSelectedBg : sortHoverBg }}
                                        onClick={() => onFilterChange({ ...filters, sortBy: sortOption.value })}
                                    >
                                        <Text>{sortOption.label}</Text>
                                        {isSelected && (
                                            <Box w="5px" h="5px" borderRadius="full" bg={sortSelectedTextColor} />
                                        )}
                                    </Flex>
                                );
                            })}
                        </VStack>
                    </Box>
                </VStack>
            </Collapse>
        </Box>
    );
}
