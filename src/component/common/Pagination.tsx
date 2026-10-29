import React from "react";
import {
  Flex,
  Text,
  Button,
  HStack,
  Select,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  // Theme Tokens
  const textColor = useColorModeValue("gray.600", "#8FA0BD");
  const activeColor = useColorModeValue("#0B1437", "#0B1437");
  const activeBg = useColorModeValue("#8BE3F8", "#8BE3F8");
  const btnBg = useColorModeValue("#F4F7FE", "#162044");
  const btnBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.08)");
  const btnHoverBg = useColorModeValue("gray.200", "#1e2c5e");
  const btnColor = useColorModeValue("gray.700", "#FFFFFF");

  // Calculate Record Range: "Showing X to Y of Z results"
  const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination items with smart ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      align="center"
      gap={4}
      pt={5}
      pb={2}
      px={2}
      borderTop="1px solid"
      borderColor={useColorModeValue("gray.100", "rgba(255, 255, 255, 0.05)")}
      w="100%"
      userSelect="none"
    >
      {/* Left: Record Range Summary */}
      <Text fontSize="xs" color={textColor} fontWeight="500">
        Showing{" "}
        <Text as="span" fontWeight="700" color={useColorModeValue("gray.800", "#FFFFFF")}>
          {startRecord}
        </Text>{" "}
        to{" "}
        <Text as="span" fontWeight="700" color={useColorModeValue("gray.800", "#FFFFFF")}>
          {endRecord}
        </Text>{" "}
        of{" "}
        <Text as="span" fontWeight="700" color={useColorModeValue("gray.800", "#FFFFFF")}>
          {totalItems}
        </Text>{" "}
        results
      </Text>

      {/* Center: Numeric Page Navigation */}
      <HStack spacing={1.5} flexWrap="wrap" justify="center">
        {/* Previous Page Button */}
        <Button
          size="sm"
          w="34px"
          h="34px"
          p={0}
          borderRadius="full"
          variant="outline"
          bg={btnBg}
          border={`1px solid ${btnBorder}`}
          color={btnColor}
          _hover={{ bg: btnHoverBg }}
          isDisabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Page Buttons with Ellipsis */}
        {pages.map((p, idx) => {
          if (typeof p === "string") {
            return (
              <Box
                key={`ellipsis-${idx}`}
                px={1.5}
                color={textColor}
                fontSize="xs"
                fontWeight="bold"
              >
                ...
              </Box>
            );
          }

          const isActive = p === currentPage;
          return (
            <Button
              key={`page-${p}`}
              size="sm"
              w="34px"
              h="34px"
              p={0}
              borderRadius="full"
              fontSize="xs"
              fontWeight={isActive ? "800" : "600"}
              bg={isActive ? activeBg : btnBg}
              color={isActive ? activeColor : btnColor}
              border={`1px solid ${isActive ? activeBg : btnBorder}`}
              boxShadow={isActive ? "0 4px 12px rgba(139, 227, 248, 0.35)" : "none"}
              _hover={{
                bg: isActive ? activeBg : btnHoverBg,
                transform: isActive ? "none" : "translateY(-1px)",
              }}
              isDisabled={isLoading}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          );
        })}

        {/* Next Page Button */}
        <Button
          size="sm"
          w="34px"
          h="34px"
          p={0}
          borderRadius="full"
          variant="outline"
          bg={btnBg}
          border={`1px solid ${btnBorder}`}
          color={btnColor}
          _hover={{ bg: btnHoverBg }}
          isDisabled={currentPage >= totalPages || totalPages === 0 || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </Button>
      </HStack>

      {/* Right: Items Per Page Dropdown */}
      {onPageSizeChange && (
        <Flex align="center" gap={2}>
          <Text fontSize="xs" color={textColor} whiteSpace="nowrap">
            Per page:
          </Text>
          <Select
            size="sm"
            w="85px"
            h="32px"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            borderRadius="full"
            bg={btnBg}
            border={`1px solid ${btnBorder}`}
            color={btnColor}
            fontSize="xs"
            fontWeight="600"
            cursor="pointer"
            _focus={{ borderColor: "#8BE3F8" }}
            isDisabled={isLoading}
          >
            {pageSizeOptions.map((opt) => (
              <option
                key={opt}
                value={opt}
                style={{ background: "#111C44", color: "#FFFFFF" }}
              >
                {opt}
              </option>
            ))}
          </Select>
        </Flex>
      )}
    </Flex>
  );
}
