import { useEffect, useState, useMemo } from "react";
import {
  Flex,
  Card,
  Box,
  Text,
  Badge,
  HStack,
  useToast,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { Search, ChevronDown, Plus, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Table, { Column } from "../../../component/table/table";
import { productRepository, ProductsTableData } from "../../../api/product";
import { getProductImageUrl } from "../../../utils/imageUtils";
import Pagination from "../../../component/common/Pagination";
import { useDebounce } from "../../../hooks/debounce/debounce";

export default function ProductTable() {
  const [products, setProducts] = useState<ProductsTableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Server-driven pagination states
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isServerPaginated, setIsServerPaginated] = useState<boolean>(false);

  // Debounced search to prevent redundant API queries
  const debouncedSearch = useDebounce(searchTerm, 350);

  const navigate = useNavigate();
  const toast = useToast();

  // Delete Confirmation Modal States
  const [productToDelete, setProductToDelete] = useState<ProductsTableData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Color Mode Tokens: Light mode (White / Slate) vs Dark mode (Navy Blue / Deep Slate)
  const cardBg = useColorModeValue("white", "#0B1437");
  const cardBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.05)");
  const cardShadow = useColorModeValue(
    "0 10px 30px rgba(112, 98, 185, 0.08)",
    "0 20px 40px rgba(0, 0, 0, 0.35)"
  );

  const inputBg = useColorModeValue("#F4F7FE", "#162044");
  const inputBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.08)");
  const inputColor = useColorModeValue("gray.800", "#FFFFFF");
  const placeholderColor = useColorModeValue("gray.400", "#8FA0BD");
  const searchIconColor = useColorModeValue("gray.400", "#8FA0BD");

  const pillBg = useColorModeValue("#F4F7FE", "#162044");
  const pillBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.08)");
  const pillColor = useColorModeValue("gray.700", "#FFFFFF");
  const pillHoverBg = useColorModeValue("gray.200", "#1e2c5e");

  const menuBg = useColorModeValue("white", "#111C44");
  const menuBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.1)");
  const menuItemColor = useColorModeValue("gray.700", "#FFFFFF");
  const menuItemHover = useColorModeValue("gray.100", "rgba(255, 255, 255, 0.08)");

  const titleColor = useColorModeValue("gray.800", "#FFFFFF");
  const subTextColor = useColorModeValue("gray.600", "#E2E8F0");
  const imageBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.15)");
  const imageBg = useColorModeValue("gray.50", "rgba(255, 255, 255, 0.05)");

  const priceBg = useColorModeValue("blue.50", "rgba(56, 189, 248, 0.12)");
  const priceColor = useColorModeValue("blue.600", "#38bdf8");
  const priceBorder = useColorModeValue("blue.200", "rgba(56, 189, 248, 0.25)");

  const statusAvailableColor = useColorModeValue("green.600", "#34D399");
  const statusOutColor = useColorModeValue("red.600", "#F87171");
  const statusOtherColor = useColorModeValue("orange.500", "#FBBF24");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productRepository.getAllProduct({
        page,
        limit: pageSize,
        search: debouncedSearch,
        status: selectedStatus,
        category: selectedCategory,
        brand: selectedBrand,
      });

      if (res && res.success && Array.isArray(res.data)) {
        setProducts(res.data);
        if (res.pagination) {
          setIsServerPaginated(true);
          setTotalItems(res.pagination.total ?? 0);
          setTotalPages(res.pagination.totalPages ?? 1);
        } else {
          setIsServerPaginated(false);
          setTotalItems(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      } else if (Array.isArray(res)) {
        setIsServerPaginated(false);
        setProducts(res);
        setTotalItems(res.length);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
      } else {
        setProducts([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 whenever any filter criteria changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedBrand, selectedCategory, selectedStatus]);

  // Fetch when page, pageSize, or any debounced filter changes
  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, debouncedSearch, selectedBrand, selectedCategory, selectedStatus]);

  const handleEdit = (row: ProductsTableData) => {
    const id = row._id || row.id;
    navigate(`/Shopio/superadmin/addproduct?edit=${id}`);
  };

  const handleDeleteClick = (row: ProductsTableData) => {
    setProductToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete._id || productToDelete.id;
    if (!id) return;

    try {
      setIsDeleting(true);
      await productRepository.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => (item._id || item.id) !== id));
      toast({
        title: "Product Deleted",
        description: `"${productToDelete.title}" has been successfully deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Could not delete this product. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  // Real-time filtering
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const title = (prod.title || "").toLowerCase();
      const brand = (prod.brand || "").toLowerCase();
      const category = (prod.category || "").toLowerCase();
      const status = (prod.status || "available").toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !term ||
        title.includes(term) ||
        brand.includes(term) ||
        category.includes(term);

      const matchesBrand =
        selectedBrand === "all" ||
        brand === selectedBrand.toLowerCase();

      const matchesCategory =
        selectedCategory === "all" ||
        category === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" ||
        status === selectedStatus.toLowerCase();

      return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedBrand, selectedCategory, selectedStatus]);

  const displayProducts = useMemo(() => {
    if (isServerPaginated) {
      return products;
    }
    return filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  }, [isServerPaginated, products, filteredProducts, page, pageSize]);

  const currentTotalItems = isServerPaginated ? totalItems : filteredProducts.length;
  const currentTotalPages = isServerPaginated ? totalPages : Math.ceil(filteredProducts.length / pageSize) || 1;


  // const handleResetFilters = () => {
  //   setSearchTerm("");
  //   setSelectedBrand("all");
  //   setSelectedCategory("all");
  //   setSelectedStatus("all");
  //   setPage(1);
  // };

  const columns: Column<ProductsTableData>[] = useMemo(
    () => [
      {
        header: "PRODUCT NAME",
        accessor: "title",
        render: (row) => (
          <HStack spacing={3}>
            <Image
              src={getProductImageUrl(row.image)}
              alt={row.title}
              boxSize="38px"
              borderRadius="full"
              objectFit="cover"
              fallbackSrc="https://via.placeholder.com/38?text=P"
              border={`1.5px solid ${imageBorder}`}
              bg={imageBg}
            />
            <Text
              fontWeight="bold"
              fontSize="sm"
              color={titleColor}
              noOfLines={1}
              maxW="220px"
              title={row.title}
            >
              {row.title}
            </Text>
          </HStack>
        ),
      },
      {
        header: "CATEGORY",
        accessor: "category",
        render: (row) => (
          <Text fontSize="sm" fontWeight="bold" color={subTextColor}>
            {row.category || "General"}
          </Text>
        ),
      },
      {
        header: "BRAND",
        accessor: "brand",
        render: (row) => (
          <Text fontSize="sm" fontWeight="bold" color={subTextColor}>
            {row.brand || "-"}
          </Text>
        ),
      },
      {
        header: "PRICE",
        accessor: "price",
        render: (row) => (
          <Badge
            bg={priceBg}
            color={priceColor}
            border={`1px solid ${priceBorder}`}
            borderRadius="full"
            px={3}
            py={0.5}
            fontSize="sm"
            fontWeight="bold"
          >
            ₹{Number(row.price || 0).toLocaleString()}
          </Badge>
        ),
      },
      {
        header: "STATUS",
        accessor: "status",
        render: (row) => {
          const status = (row.status || "Available").toLowerCase();
          const isAvailable = status === "Available";
          const isOut = status === "out of stock";

          const color = isAvailable
            ? statusAvailableColor
            : isOut
              ? statusOutColor
              : statusOtherColor;

          return (
            <Badge
              bg="blue.100"
              color={color}
              fontSize="sm"
              fontWeight="bold"
              letterSpacing="0.5px"
              borderRadius={"full"}
              p={2}
            >
              {row.status || "Available"}
            </Badge>
          );
        },
      },
    ],
    [
      titleColor,
      subTextColor,
      imageBorder,
      imageBg,
      priceBg,
      priceColor,
      priceBorder,
      statusAvailableColor,
      statusOutColor,
      statusOtherColor,
    ]
  );

  return (
    <Box w="100%">
      <Card
        bg={cardBg}
        borderRadius={{ base: "xl", md: "2xl" }}
        boxShadow={cardShadow}
        border={`1px solid ${cardBorder}`}
        w="100%"
        p={{ base: 3, sm: 4, md: 6 }}
        transition="all 0.25s ease"
      >
        <Flex
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          mb={6}
          flexDirection={{ base: "column", sm: "row" }}
          gap={3}
        >
          <HStack spacing={2} flexWrap="wrap" flex="1">

            <InputGroup size="md" w={{ base: "100%", md: "240px" }}>
              <InputLeftElement pointerEvents="none">
                <Search size={16} color={searchIconColor} />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={inputBg}
                border={`1px solid ${inputBorder}`}
                borderRadius="full"
                color={inputColor}
                fontSize="sm"
                _placeholder={{ color: placeholderColor }}
                _focus={{
                  borderColor: "#38bdf8",
                  boxShadow: "0 0 0 1px #38bdf8",
                }}
              />
            </InputGroup>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDown size={15} />}
                bg={pillBg}
                color={pillColor}
                borderRadius="full"
                px={4}
                size="md"
                fontSize="sm"
                fontWeight="600"
                border={`1px solid ${pillBorder}`}
                _hover={{ bg: pillHoverBg }}
                _active={{ bg: pillHoverBg }}
              >
                {selectedCategory === "all" ? "Category" : selectedCategory}
              </MenuButton>
              <MenuList
                bg={menuBg}
                borderColor={menuBorder}
                boxShadow="0 10px 25px rgba(0,0,0,0.2)"
                borderRadius="xl"
                p={2}
                zIndex={10}
                maxH="300px"
                overflowY="auto"
              >
                <MenuItem
                  bg="transparent"
                  color={menuItemColor}
                  _hover={{ bg: menuItemHover }}
                  borderRadius="md"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Categories
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem
                    key={category}
                    bg="transparent"
                    color={menuItemColor}
                    _hover={{ bg: menuItemHover }}
                    borderRadius="md"
                    onClick={() => {
                      console.log("Selected Category:", category);
                      setSelectedCategory(category);
                    }}
                  >
                    {category}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            {/* Status Filter Pill */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDown size={15} />}
                bg={pillBg}
                color={pillColor}
                borderRadius="full"
                px={4}
                size="md"
                fontSize="sm"
                fontWeight="600"
                border={`1px solid ${pillBorder}`}
                _hover={{ bg: pillHoverBg }}
                _active={{ bg: pillHoverBg }}
              >
                {selectedStatus === "all"
                  ? "Status"
                  : selectedStatus === "Available"
                    ? "Available"
                    : selectedStatus === "OUT OF STOCK"
                      ? "OUT OF STOCK"
                      : "UNAAvailable"}
              </MenuButton>
              <MenuList
                bg={menuBg}
                borderColor={menuBorder}
                boxShadow="0 10px 25px rgba(0,0,0,0.2)"
                borderRadius="xl"
                p={2}
                zIndex={10}
              >
                <MenuItem
                  bg="transparent"
                  color={menuItemColor}
                  _hover={{ bg: menuItemHover }}
                  borderRadius="md"
                  onClick={() => setSelectedStatus("all")}
                >
                  All Statuses
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  color="#34D399"
                  _hover={{ bg: "rgba(16, 185, 129, 0.15)" }}
                  borderRadius="md"
                  onClick={() => setSelectedStatus("Available")}
                >
                  Available
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  color="#F87171"
                  _hover={{ bg: "rgba(239, 68, 68, 0.15)" }}
                  borderRadius="md"
                  onClick={() => setSelectedStatus("out of stock")}
                >
                  Out of Stock
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  color="#FBBF24"
                  _hover={{ bg: "rgba(245, 158, 11, 0.15)" }}
                  borderRadius="md"
                  onClick={() => setSelectedStatus("UnAvailable")}
                >
                  UnAvailable
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          <Button
            leftIcon={<Plus size={16} />}
            bg="#8BE3F8"
            color="#0B1437"
            borderRadius="full"
            px={6}
            size="md"
            fontSize="sm"
            fontWeight="700"
            w={{ base: "100%", sm: "auto" }}
            boxShadow="0 4px 14px rgba(139, 227, 248, 0.35)"
            _hover={{
              bg: "#60d3ee",
              transform: "translateY(-1px)",
              boxShadow: "0 6px 18px rgba(139, 227, 248, 0.45)",
            }}
            _active={{
              bg: "#38bdf8",
              transform: "translateY(0)",
            }}
            onClick={() => navigate("/Shopio/superadmin/addproduct")}
          >
            Add
          </Button>
        </Flex>

        {/* Table View */}
        <Box overflowX="auto" w="100%">
          <Table<ProductsTableData>
            columns={columns}
            data={displayProducts}
            loading={loading}
            emptyMessage="No matching products found"
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            actionsHeader="ACTIONS"
          />
        </Box>

        {/* Server-Driven Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={currentTotalPages}
          pageSize={pageSize}
          totalItems={currentTotalItems}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          isLoading={loading}
        />

        {/* Centered Delete Confirmation Alert Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          isCentered
          motionPreset="scale"
        >
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
          <ModalContent
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="2xl"
            boxShadow="2xl"
            p={6}
            maxW="420px"
            textAlign="center"
          >
            <ModalCloseButton
              position="absolute"
              top={3}
              right={3}
              borderRadius="full"
              isDisabled={isDeleting}
            />

            {/* Warning Icon Badge */}
            <Flex
              align="center"
              justify="center"
              w="60px"
              h="60px"
              borderRadius="full"
              bg="rgba(239, 68, 68, 0.12)"
              border="2px solid rgba(239, 68, 68, 0.25)"
              mx="auto"
              mb={4}
            >
              <AlertTriangle size={30} color="#EF4444" />
            </Flex>

            <Text fontSize="xl" fontWeight="700" color={titleColor} mb={2}>
              Delete Product?
            </Text>

            <Text fontSize="sm" color={subTextColor} mb={4} lineHeight="tall">
              Are you sure you want to delete this product? This action cannot be undone and will permanently remove it from the store.
            </Text>

            {/* Product Snapshot Card */}
            {productToDelete && (
              <HStack
                p={3}
                bg={inputBg}
                borderRadius="xl"
                border="1px solid"
                borderColor={inputBorder}
                spacing={3}
                mb={6}
                align="center"
              >
                <Image
                  src={getProductImageUrl(productToDelete.image?.[0])}
                  alt={productToDelete.title}
                  boxSize="46px"
                  borderRadius="lg"
                  objectFit="cover"
                  fallbackSrc="https://via.placeholder.com/46?text=Product"
                />
                <Box textAlign="left" overflow="hidden" flex={1}>
                  <Text fontSize="sm" fontWeight="600" color={titleColor} noOfLines={1}>
                    {productToDelete.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    ${Number(productToDelete.price || 0).toFixed(2)} • {productToDelete.category || "General"}
                  </Text>
                </Box>
              </HStack>
            )}

            {/* Action Buttons */}
            <HStack spacing={3} w="100%">
              <Button
                variant="ghost"
                flex={1}
                borderRadius="xl"
                onClick={handleCancelDelete}
                isDisabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                flex={1}
                borderRadius="xl"
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                loadingText="Deleting..."
                leftIcon={<Trash2 size={16} />}
              >
                Delete
              </Button>
            </HStack>
          </ModalContent>
        </Modal>
      </Card>
    </Box>
  );
}
