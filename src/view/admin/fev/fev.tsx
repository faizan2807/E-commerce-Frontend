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
import { useEffect, useState } from "react";
import { ProductsTableData, productRepository } from "../../../api/product";
import { Star, Heart, ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProductImageUrl } from "../../../utils/imageUtils";
import { useAuth } from "../../../context/AuthContext";
import { useCenterAlert } from "../../../context/AlertContext";
import { cartApi } from "../../../api/cart";
import { addToLocalCart, dispatchCartUpdate } from "../../../utils/cartStorage";
import { getLocalFavourites, removeLocalFavourite } from "../../../utils/favouriteStorage";


export default function FevouriteProduct() {
    const { token, userId } = useAuth();
    const { showAlert } = useCenterAlert();
    const navigate = useNavigate();

    const [fevProduct, setFevProduct] = useState<ProductsTableData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.200", "gray.700");
    const headingColor = useColorModeValue("gray.900", "white");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const stageBg = useColorModeValue("radial-gradient(ellipse at center, #ffffff 0%, #f8fafc 100%)", "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)");
    const ratingBg = useColorModeValue("#fffbeb", "rgba(245, 158, 11, 0.12)");
    const ratingBorder = useColorModeValue("#fef3c7", "rgba(245, 158, 11, 0.25)");
    const ratingTextColor = useColorModeValue("#b45309", "#fbbf24");
    const emptyStateBg = useColorModeValue("white", "gray.800");

    const fetchFevProducts = async () => {
        if (!token) {
            setFevProduct(getLocalFavourites());
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await productRepository.getFavouriteProducts(userId || undefined);
            if (response && response.data) {
                setFevProduct(Array.isArray(response.data) ? response.data : []);
            } else {
                setFevProduct([]);
            }
        } catch (err: any) {
            console.error("Failed to fetch favourite products:", err);
            showAlert({
                title: "Failed to Load Wishlist",
                description: err.response?.data?.message || "Could not retrieve your favourite items.",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFevProducts();

        const handleFavUpdate = () => {
            if (!token) {
                setFevProduct(getLocalFavourites());
            }
        };

        window.addEventListener("favourite-updated", handleFavUpdate);
        return () => {
            window.removeEventListener("favourite-updated", handleFavUpdate);
        };
    }, [token, userId]);

    // Remove or toggle favourite
    const handleRemoveFavourite = async (productId: string, productTitle: string) => {
        if (!token) {
            removeLocalFavourite(productId);
            setFevProduct((prev) => prev.filter((p) => (p._id || p.id) !== productId));
            showAlert({
                title: "Removed from Wishlist",
                description: `${productTitle} was removed from your favourites.`,
                status: "info",
                duration: 2000,
            });
            return;
        }

        try {
            setActionLoadingId(productId);
            await productRepository.postFavouriteProductsByUserId(productId, userId || undefined);

            // Remove from local list immediately
            setFevProduct((prev) => prev.filter((p) => (p._id || p.id) !== productId));
            window.dispatchEvent(new Event("favourite-updated"));

            showAlert({
                title: "Removed from Wishlist",
                description: `${productTitle} was removed from your favourites.`,
                status: "info",
                duration: 2000,
            });
        } catch (err: any) {
            console.error("Failed to remove favourite:", err);
            showAlert({
                title: "Action Failed",
                description: err.response?.data?.message || "Could not update favourite status.",
                status: "error",
            });
        } finally {
            setActionLoadingId(null);
        }
    };

    // Add product to cart directly from Wishlist
    const handleAddToCart = async (product: ProductsTableData) => {
        const productIdVal = product._id || product.id;
        const imgArr = Array.isArray(product.image) ? product.image : product.image ? [product.image] : [];
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

    if (!token) {
        return (
            <Container maxW="1480px" px={{ base: 4, md: 8 }} py={12}>
                <Box
                    bg="white"
                    borderRadius="2xl"
                    p={{ base: 8, md: 16 }}
                    textAlign="center"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor="gray.200"
                    maxW="540px"
                    mx="auto"
                >
                    <Box
                        p={5}
                        bg="red.50"
                        color="red.500"
                        borderRadius="full"
                        display="inline-flex"
                        mb={4}
                    >
                        <Heart size={48} />
                    </Box>
                    <Heading size="md" color="gray.800" mb={2}>
                        Please Sign In to View Wishlist
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mb={6}>
                        Sign in to your account to save your favourite products and access them anytime.
                    </Text>
                    <Button
                        colorScheme="red"
                        size="md"
                        borderRadius="xl"
                        px={8}
                        onClick={() => navigate("/Shopio/login")}
                    >
                        Sign In Now
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxW="1480px" px={{ base: 4, md: 8 }} py={8}>
            <HStack mb={6} spacing={3}>
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft size={16} />}
                    onClick={() => navigate("/Shopio")}
                    colorScheme="red"
                >
                    Back to Products
                </Button>
            </HStack>

            <Flex
                align="center"
                justify="space-between"
                mb={6}
                wrap="wrap"
                gap={3}
            >
                <Box>
                    <Heading size="lg" color="gray.800" fontWeight="bold">
                        My Wishlist & Favourites
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                        {fevProduct.length} {fevProduct.length === 1 ? "item" : "items"} saved in your wishlist
                    </Text>
                </Box>
            </Flex>

            {loading ? (
                <Flex justify="center" align="center" minH="300px">
                    <Spinner size="xl" color="red.500" thickness="3px" />
                </Flex>
            ) : fevProduct.length === 0 ? (
                <Box
                    bg={emptyStateBg}
                    borderRadius="2xl"
                    p={{ base: 8, md: 16 }}
                    textAlign="center"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor={cardBorder}
                >
                    <VStack spacing={4} maxW="400px" mx="auto">
                        <Box
                            p={5}
                            bg="pink.50"
                            color="pink.500"
                            borderRadius="full"
                            display="inline-flex"
                        >
                            <Heart size={48} />
                        </Box>
                        <Heading size="md" color="gray.800">
                            Your wishlist is empty!
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                            Explore trending products and shortlist some of your favourite items.
                        </Text>
                        <Button
                            colorScheme="red"
                            size="md"
                            borderRadius="full"
                            px={8}
                            mt={2}
                            onClick={() => navigate("/Shopio")}
                        >
                            Explore Trending Products
                        </Button>
                    </VStack>
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
                    {fevProduct.map((product) => {
                        const pid = product._id || product.id;
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
                                {/* Favourite Remove Button on Card */}
                                <Tooltip label="Remove from Wishlist" hasArrow>
                                    <IconButton
                                        aria-label="Remove favourite"
                                        icon={<Heart size={16} fill="#ef4444" color="#ef4444" />}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFavourite(pid, product.title);
                                        }}
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
                                </Box>

                                {/* Product Details Section */}
                                <VStack align="stretch" spacing={2.5} p={4} flex="1" bg={cardBg}>
                                    <HStack justifyContent="space-between">
                                        <Badge
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
                                            {product.category || "General"}
                                        </Badge>
                                        {product.status && (
                                            <Badge
                                                colorScheme={
                                                    product.status.toLowerCase().includes("out")
                                                        ? "gray"
                                                        : "green"
                                                }
                                                fontSize="2xs"
                                                borderRadius="full"
                                                px={2}
                                                py={0.5}
                                            >
                                                {product.status}
                                            </Badge>
                                        )}
                                    </HStack>

                                    <Text
                                        fontSize="sm"
                                        noOfLines={2}
                                        color={headingColor}
                                        fontWeight="bold"
                                        lineHeight="1.4"
                                        cursor="pointer"
                                        transition="color 0.2s"
                                        _groupHover={{ color: "red.400" }}
                                        onClick={() => navigate(`/Shopio/productDetails/${pid}`)}
                                    >
                                        {product.title}
                                    </Text>

                                    {/* Rating Chip */}
                                    <HStack spacing={1.5}>
                                        <HStack
                                            spacing={1}
                                            bg={ratingBg}
                                            border="1px solid"
                                            borderColor={ratingBorder}
                                            px={2}
                                            py={0.5}
                                            borderRadius="md"
                                        >
                                            <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                            <Text fontSize="xs" fontWeight="bold" color={ratingTextColor}>
                                                {product.rating?.rate ?? 0}
                                            </Text>
                                        </HStack>
                                        <Text fontSize="2xs" color="gray.400">
                                            ({product.rating?.count ?? 0} reviews)
                                        </Text>
                                    </HStack>

                                    {/* Price Tag with Free Delivery micro-accent */}
                                    <HStack justify="space-between" align="baseline" mt="auto" pt={1}>
                                        <Text fontSize="md" fontWeight="black" color={headingColor}>
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </Text>
                                        <Text fontSize="2xs" fontWeight="semibold" color="green.400">
                                            Free Delivery
                                        </Text>
                                    </HStack>

                                    {/* Action Buttons */}
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
                                        <IconButton
                                            aria-label="Remove"
                                            icon={<Trash2 size={15} />}
                                            size="sm"
                                            variant="outline"
                                            borderColor="gray.200"
                                            color="gray.400"
                                            borderRadius="xl"
                                            _hover={{ bg: "red.50", color: "red.500", borderColor: "red.200" }}
                                            onClick={() => handleRemoveFavourite(pid, product.title)}
                                        />
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