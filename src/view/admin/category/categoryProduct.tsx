import {
    Flex,
    Box,
    Text,
    SimpleGrid,
    VStack,
    HStack,
    Badge,
    Button,
    Image,
    Container,
    Heading,
    Spinner,
    IconButton,
    Tooltip,
    useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductsTableData, productRepository } from "../../../api/product";
import { Star, Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { getProductImageUrl } from "../../../utils/imageUtils";
import { useAuth } from "../../../context/AuthContext";
import { useCenterAlert } from "../../../context/AlertContext";
import { cartApi } from "../../../api/cart";
import { addToLocalCart, dispatchCartUpdate } from "../../../utils/cartStorage";
import { toggleLocalFavourite, getLocalFavouriteIds } from "../../../utils/favouriteStorage";
import FilterNavbar, { FilterState } from "../../../component/navbar/filterNavbar";

export default function CategoryProduct() {
    const { categoryName } = useParams<{ categoryName: string }>();
    const navigate = useNavigate();
    const { token, userId } = useAuth();
    const { showAlert } = useCenterAlert();

    const [allProducts, setAllProducts] = useState<ProductsTableData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.200", "gray.700");
    const headingColor = useColorModeValue("gray.900", "white");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const stageBg = useColorModeValue("radial-gradient(ellipse at center, #ffffff 0%, #f8fafc 100%)", "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)");
    const ratingBg = useColorModeValue("#fffbeb", "rgba(245, 158, 11, 0.12)");
    const ratingBorder = useColorModeValue("#fef3c7", "rgba(245, 158, 11, 0.25)");
    const ratingTextColor = useColorModeValue("#b45309", "#fbbf24");

    const [filters, setFilters] = useState<FilterState>({
        brand: "all",
        priceRange: "all",
        sortBy: "default",
    });

    // Format human-readable title from url parameter
    const formattedCategoryTitle = useMemo(() => {
        if (!categoryName) return "Category Products";
        const lower = categoryName.toLowerCase();
        if (lower.includes("electronic")) return "Electronics & Gadgets";
        if (lower.includes("home")) return "Home & Furniture";
        if (lower.includes("beauty")) return "Beauty & Personal Care";
        if (lower.includes("fashion")) return "Fashion & Apparel";
        return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    }, [categoryName]);

    // Fetch products by category
    useEffect(() => {
        const fetchCategoryProducts = async () => {
            if (!categoryName) return;
            try {
                setLoading(true);
                // First try direct category endpoint
                let res = await productRepository.getproductByCategory(categoryName);

                // If empty or broader matching needed, also fetch all and filter leniently
                if (!res || !res.success || !Array.isArray(res.data) || res.data.length === 0) {
                    const allRes = await productRepository.getAllProduct();
                    if (allRes && allRes.success && Array.isArray(allRes.data)) {
                        const target = categoryName.toLowerCase();
                        const filtered = allRes.data.filter((p) => {
                            const cat = (p.category || "").toLowerCase();
                            if (target.includes("electronic")) return cat.includes("elect");
                            if (target.includes("home")) return cat.includes("home") || cat.includes("furn");
                            if (target.includes("beauty")) return cat.includes("beauty") || cat.includes("care");
                            if (target.includes("fashion")) return cat.includes("fash") || cat.includes("cloth");
                            return cat.includes(target);
                        });
                        setAllProducts(filtered);
                        return;
                    }
                }

                if (res && res.success && Array.isArray(res.data)) {
                    setAllProducts(res.data);
                } else {
                    setAllProducts([]);
                }
            } catch (error) {
                console.error("Failed to load category products:", error);
                setAllProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, [categoryName]);

    // Sync favourite IDs
    useEffect(() => {
        const syncFavIds = () => {
            if (token) {
                productRepository
                    .getFavouriteProducts(userId || undefined)
                    .then((res) => {
                        if (res && res.data && Array.isArray(res.data)) {
                            const ids = new Set(res.data.map((p) => p._id || p.id));
                            setFavouriteIds(ids);
                        }
                    })
                    .catch(() => { });
            } else {
                setFavouriteIds(getLocalFavouriteIds());
            }
        };

        syncFavIds();
        window.addEventListener("favourite-updated", syncFavIds);
        return () => {
            window.removeEventListener("favourite-updated", syncFavIds);
        };
    }, [token, userId]);

    // Extract unique brands for filter
    const availableBrands = useMemo(() => {
        const brands = new Set<string>();
        allProducts.forEach((p) => {
            if (p.brand && p.brand.trim()) {
                brands.add(p.brand.trim());
            }
        });
        return Array.from(brands).sort();
    }, [allProducts]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...allProducts];

        // Brand filter
        if (filters.brand && filters.brand !== "all") {
            result = result.filter(
                (p) => (p.brand || "").toLowerCase() === filters.brand.toLowerCase()
            );
        }

        // Price filter
        if (filters.priceRange && filters.priceRange !== "all") {
            const [minStr, maxStr] = filters.priceRange.split("-");
            const min = Number(minStr) || 0;
            const max = maxStr === "above" ? Infinity : Number(maxStr) || Infinity;
            result = result.filter((p) => {
                const price = Number(p.price) || 0;
                return price >= min && price <= max;
            });
        }

        // Sort
        if (filters.sortBy === "price-asc") {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (filters.sortBy === "price-desc") {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (filters.sortBy === "rating-desc") {
            result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
        }

        return result;
    }, [allProducts, filters]);

    // Toggle Favourite ("like fav")
    const handleToggleFavourite = async (
        e: React.MouseEvent,
        productId: string,
        title: string,
        productItem?: ProductsTableData
    ) => {
        e.stopPropagation();

        if (!token) {
            const targetProduct = productItem || allProducts.find((p) => (p._id || p.id) === productId);
            if (!targetProduct) return;

            const { isFavourite } = toggleLocalFavourite(targetProduct);
            setFavouriteIds((prev) => {
                const next = new Set(prev);
                if (isFavourite) next.add(productId);
                else next.delete(productId);
                return next;
            });

            showAlert({
                title: isFavourite ? "Added to Wishlist!" : "Removed from Wishlist",
                description: isFavourite
                    ? `${title} was added to your favourites.`
                    : `${title} was removed from your favourites.`,
                status: isFavourite ? "success" : "info",
                duration: 2000,
            });
            return;
        }

        try {
            setActionLoadingId(productId);
            await productRepository.postFavouriteProductsByUserId(productId, userId || undefined);
            const isFav = favouriteIds.has(productId);

            setFavouriteIds((prev) => {
                const next = new Set(prev);
                if (isFav) {
                    next.delete(productId);
                } else {
                    next.add(productId);
                }
                return next;
            });

            window.dispatchEvent(new Event("favourite-updated"));

            showAlert({
                title: !isFav ? "Added to Wishlist!" : "Removed from Wishlist",
                description: !isFav
                    ? `${title} was added to your favourites.`
                    : `${title} was removed from your favourites.`,
                status: !isFav ? "success" : "info",
                duration: 2000,
            });
        } catch (err: any) {
            showAlert({
                title: "Action Failed",
                description: err.response?.data?.message || "Could not update favourite status.",
                status: "error",
            });
        } finally {
            setActionLoadingId(null);
        }
    };

    // Add to Cart
    const handleAddToCart = async (product: ProductsTableData) => {
        const productIdVal = product._id || product.id;
        const imgArr = Array.isArray(product.image)
            ? product.image
            : product.image
                ? [product.image]
                : [];
        const mainImg = imgArr[0] || "";

        try {
            if (token) {
                await cartApi.addToCart(productIdVal, 1, {
                    title: product.title,
                    price: product.price,
                    category: product.category,
                    image: imgArr,
                    brand: product.brand,
                });
            } else {
                addToLocalCart({
                    id: productIdVal,
                    productId: productIdVal,
                    title: product.title,
                    price: product.price,
                    image: mainImg,
                    images: imgArr,
                    quantity: 1,
                    category: product.category,
                    brand: product.brand,
                });
            }

            dispatchCartUpdate();

            showAlert({
                title: "Added to Cart!",
                description: `${product.title} has been moved to your cart.`,
                status: "success",
                duration: 2000,
            });
        } catch (err: any) {
            showAlert({
                title: "Failed to Add to Cart",
                description: err.response?.data?.message || err.message,
                status: "error",
            });
        }
    };

    const handleResetFilters = () => {
        setFilters({
            brand: "all",
            priceRange: "all",
            sortBy: "default",
        });
    };

    return (
        <Container maxW="1480px" px={{ base: 4, md: 8 }} py={8}>

            {/* Page Header */}
            <Box mb={6}>
                <HStack spacing={3} mb={1}>
                    <Heading size="lg" color="gray.800" fontWeight="black" letterSpacing="-0.5px">
                        {formattedCategoryTitle}
                    </Heading>
                    <Badge colorScheme="red" fontSize="sm" px={3} py={1} borderRadius="full">
                        {allProducts.length} Products
                    </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                    Discover handpicked {formattedCategoryTitle.toLowerCase()} with exclusive deals and verified authentic stock.
                </Text>
            </Box>

            {/* Filter Navbar (Brand, Price, Sort) */}
            <FilterNavbar
                availableBrands={availableBrands}
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
                totalCount={filteredProducts.length}
                categoryTitle={formattedCategoryTitle}
            />

            {/* Product Grid or States */}
            {loading ? (
                <Flex justify="center" align="center" minH="350px">
                    <Spinner size="xl" color="red.500" thickness="3px" />
                </Flex>
            ) : filteredProducts.length === 0 ? (
                <Box
                    bg="white"
                    borderRadius="2xl"
                    p={{ base: 8, md: 14 }}
                    textAlign="center"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor="gray.200"
                    maxW="600px"
                    mx="auto"
                >
                    <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={2}>
                        No Products Found
                    </Text>
                    <Text fontSize="sm" color="gray.500" mb={6}>
                        No items match your active filters in {formattedCategoryTitle}. Try adjusting the brand or price range.
                    </Text>
                    <Button colorScheme="red" size="sm" borderRadius="full" onClick={handleResetFilters}>
                        Reset All Filters
                    </Button>
                </Box>
            ) : (
                <SimpleGrid
                    columns={{
                        base: 1,
                        sm: 2,
                        md: 3,
                        lg: 4,
                        xl: 5,
                    }}
                    spacing={4}
                >
                    {filteredProducts.map((product) => {
                        const pid = product._id || product.id;
                        const isFav = favouriteIds.has(pid);

                        return (
                            <Box
                                key={pid}
                                borderWidth="1px"
                                borderColor={cardBorder}
                                minH="360px"
                                w="100%"
                                borderRadius="2xl"
                                overflow="hidden"
                                bg={cardBg}
                                boxShadow="0 4px 18px -2px rgba(0, 0, 0, 0.05)"
                                transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                                position="relative"
                                display="flex"
                                flexDirection="column"
                                role="group"
                                _hover={{
                                    transform: "translateY(-6px)",
                                    boxShadow: "0 22px 35px -8px rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(229, 62, 62, 0.1)",
                                    borderColor: "red.300",
                                }}
                            >
                                {/* Wishlist Floating Pill Button */}
                                <Tooltip
                                    label={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
                                    hasArrow
                                >
                                    <IconButton
                                        aria-label="Wishlist toggle"
                                        icon={
                                            <Heart
                                                size={15}
                                                fill={isFav ? "#ef4444" : "transparent"}
                                                color={isFav ? "#ef4444" : "#64748b"}
                                            />
                                        }
                                        size="sm"
                                        variant="solid"
                                        bg="whiteAlpha.900"
                                        backdropFilter="blur(8px)"
                                        boxShadow="0 4px 12px rgba(0,0,0,0.08)"
                                        border="1px solid"
                                        borderColor="whiteAlpha.600"
                                        borderRadius="full"
                                        position="absolute"
                                        top={3}
                                        right={3}
                                        zIndex={3}
                                        isLoading={actionLoadingId === pid}
                                        _hover={{ bg: "red.50", transform: "scale(1.15)" }}
                                        onClick={(e) => handleToggleFavourite(e, pid, product.title, product)}
                                    />
                                </Tooltip>

                                {/* Studio Product Image Stage */}
                                <Box
                                    w="100%"
                                    aspectRatio="1 / 1"
                                    maxW="800px"
                                    maxH="800px"
                                    bg={stageBg}
                                    p={4}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    cursor="pointer"
                                    position="relative"
                                    overflow="hidden"
                                    onClick={() => navigate(`/Shopio/productDetails/${pid}`)}
                                >
                                    <Image
                                        src={getProductImageUrl(product.image)}
                                        alt={product.title}
                                        w="100%"
                                        h="100%"
                                        maxW="100%"
                                        maxH="100%"
                                        objectFit="contain"
                                        transition="transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
                                        _groupHover={{ transform: "scale(1.08)" }}
                                        fallbackSrc="https://via.placeholder.com/800x800?text=No+Image"
                                    />

                                    {/* Rating Chip Overlay on Image */}
                                    <HStack
                                        position="absolute"
                                        bottom={2.5}
                                        left={2.5}
                                        bg={ratingBg}
                                        border="1px solid"
                                        borderColor={ratingBorder}
                                        px={2}
                                        py={0.5}
                                        borderRadius="md"
                                        spacing={1}
                                        boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
                                        zIndex={2}
                                    >
                                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                        <Text fontSize="xs" fontWeight="bold" color={ratingTextColor}>
                                            {product.rating?.rate ?? 0}
                                        </Text>
                                        {product.rating?.count ? (
                                            <Text fontSize="2xs" color="gray.500">
                                                ({product.rating.count})
                                            </Text>
                                        ) : null}
                                    </HStack>
                                </Box>

                                {/* Product Details Section */}
                                <VStack align="stretch" spacing={2.5} p={4} flex="1" bg={cardBg}>
                                    <HStack justify="space-between">
                                        {/* <Badge
                                            bg="red.50"
                                            color="red.600"
                                            fontSize="2xs"
                                            fontWeight="bold"
                                            borderRadius="full"
                                            px={2.5}
                                            py={0.5}
                                            textTransform="uppercase"
                                            letterSpacing="0.4px"
                                        >
                                            {product.category || formattedCategoryTitle}
                                        </Badge> */}
                                        {product.brand && (
                                            <Badge
                                                colorScheme="blue"
                                                fontSize="2xs"
                                                borderRadius="full"
                                                px={2}
                                                py={0.5}
                                            >
                                                {product.brand}
                                            </Badge>
                                        )}
                                    </HStack>

                                    <Text
                                        fontWeight="bold"
                                        fontSize="sm"
                                        noOfLines={2}
                                        color={headingColor}
                                        lineHeight="1.4"
                                        cursor="pointer"
                                        transition="color 0.2s"
                                        _groupHover={{ color: "red.400" }}
                                        onClick={() => navigate(`/Shopio/productDetails/${pid}`)}
                                    >
                                        {product.title}
                                    </Text>



                                    {/* Price Tag with Free Delivery micro-accent */}
                                    <HStack justify="space-between" align="baseline" mt="auto" pt={1}>
                                        <Text fontSize="md" fontWeight="black" color={headingColor}>
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </Text>
                                        <Text fontSize="2xs" fontWeight="semibold" color="green.400">
                                            Free Delivery
                                        </Text>
                                    </HStack>

                                    {/* High Impact Action Buttons */}
                                    <HStack spacing={2} pt={1} w="100%">
                                        <Button
                                            bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                                            color="white"
                                            size="sm"
                                            borderRadius="xl"
                                            flex="1"
                                            leftIcon={<ShoppingBag size={14} />}
                                            boxShadow="0 2px 8px rgba(229, 62, 62, 0.25)"
                                            transition="all 0.25s ease"
                                            _hover={{
                                                bg: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                                                boxShadow: "0 6px 16px -2px rgba(229, 62, 62, 0.4)",
                                                transform: "translateY(-1px)",
                                            }}
                                            _active={{ transform: "translateY(0)" }}
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            Add to Cart
                                        </Button>
                                        {/* <Button
                                            colorScheme="gray"
                                            variant="outline"
                                            size="sm"
                                            borderRadius="xl"
                                            px={3}
                                            borderColor="gray.200"
                                            _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                                            onClick={() => navigate(`/Shopio/productDetails/${pid}`)}
                                        >
                                            View
                                        </Button> */}
                                    </HStack>
                                </VStack>
                            </Box>
                        );
                    })}
                </SimpleGrid>
            )}
        </Container>
    );
}
