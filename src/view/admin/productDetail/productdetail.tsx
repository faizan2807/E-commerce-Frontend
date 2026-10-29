import {
    Box,
    Button,
    Flex,
    Heading,
    Image,
    Spinner,
    Text,
    VStack,
    HStack,
    Badge,
    Container,
    IconButton,
    Tooltip,
    SimpleGrid,
    Divider,
    useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, Truck, ShieldCheck, RotateCcw, ShoppingBag, Sparkles, LayoutGrid, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import {
    productRepository,
    ProductsTableData,
} from "../../../api/product";
import { useAuth } from "../../../context/AuthContext";
import { useCenterAlert } from "../../../context/AlertContext";
import { cartApi } from "../../../api/cart";
import { getProductImageUrl } from "../../../utils/imageUtils";
import { addToLocalCart, getLocalCart, dispatchCartUpdate } from "../../../utils/cartStorage";
import { toggleLocalFavourite, isLocalFavourite } from "../../../utils/favouriteStorage";

export default function ProductDetails() {
    const { token, userId } = useAuth();
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { showAlert } = useCenterAlert();
    const [product, setProduct] = useState<ProductsTableData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isIncart, setIsIncart] = useState<boolean>(false);
    const [isFavourite, setIsFavourite] = useState<boolean>(false);
    const [favLoading, setFavLoading] = useState<boolean>(false);

    const [similarProducts, setSimilarProducts] = useState<ProductsTableData[]>([]);
    const [similarLoading, setSimilarLoading] = useState<boolean>(false);
    const [showAllSimilar, setShowAllSimilar] = useState<boolean>(false);

    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.900", "white");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const mutedColor = useColorModeValue("gray.500", "gray.400");
    const studioBg = useColorModeValue("radial-gradient(ellipse at center, #ffffff 0%, #f8fafc 100%)", "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)");
    const priceBoxBg = useColorModeValue("gray.50", "gray.900");
    const priceBoxBorder = useColorModeValue("gray.100", "gray.700");
    const guaranteeBoxBg = useColorModeValue("gray.50", "gray.700");
    const guaranteeBoxBorder = useColorModeValue("gray.100", "gray.600");
    const dividerColor = useColorModeValue("gray.100", "gray.700");
    const backBtnColor = useColorModeValue("gray.600", "gray.300");
    const backBtnHoverBg = useColorModeValue("red.50", "whiteAlpha.100");

    const fetchSimilarProducts = async (category: string, currentId: string) => {
        try {
            setSimilarLoading(true);
            let list: ProductsTableData[] = [];
            if (category) {
                const res: any = await productRepository.getproductByCategory(category);
                const data = res?.data ?? res?.products ?? res;
                if (Array.isArray(data)) {
                    list = data;
                }
            }

            // Filter out current product
            list = list.filter((p) => (p._id || p.id) !== currentId);

            // If fewer than 8 similar items found in the same category, fill from all products as recommendations
            if (list.length < 8) {
                const allRes: any = await productRepository.getAllProduct();
                const allData = allRes?.data ?? allRes?.products ?? allRes;
                if (Array.isArray(allData)) {
                    const more = allData.filter(
                        (p) => (p._id || p.id) !== currentId && !list.some((item) => (item._id || item.id) === (p._id || p.id))
                    );
                    list = [...list, ...more];
                }
            }

            setSimilarProducts(list);
        } catch (err) {
            console.error("Error fetching similar products:", err);
        } finally {
            setSimilarLoading(false);
        }
    };

    const fetchProductById = async () => {
        try {
            setLoading(true);

            if (!productId) {
                console.error("Product ID not found");
                return;
            }

            const res: any = await productRepository.getProductById(productId);
            if (res) {
                const raw = res.data ?? res.product ?? res;
                const singleProd = Array.isArray(raw) ? raw[0] : raw;
                setProduct(singleProd);
                if (singleProd) {
                    const currentId = singleProd._id || singleProd.id;
                    fetchSimilarProducts(singleProd.category, currentId);
                }
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSimilarAddToCart = async (item: ProductsTableData, e: React.MouseEvent) => {
        e.stopPropagation();
        const productIdVal = item._id || item.id;
        const imgArr = Array.isArray(item.image) ? item.image : item.image ? [item.image] : [];
        const mainImg = imgArr[0] || "";

        try {
            if (token) {
                await cartApi.addToCart(productIdVal, 1, {
                    title: item.title,
                    price: item.price,
                    category: item.category,
                    image: imgArr,
                    brand: item.brand,
                });
            } else {
                addToLocalCart({
                    id: productIdVal,
                    productId: productIdVal,
                    title: item.title,
                    price: item.price,
                    image: mainImg,
                    images: imgArr,
                    quantity: 1,
                    category: item.category,
                    brand: item.brand,
                });
            }

            dispatchCartUpdate();

            showAlert({
                title: "Added to Cart!",
                description: `${item.title} has been added to your cart.`,
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

    const handleAddtocart = async () => {
        if (!product) return;
        const productIdVal = product._id || product.id;
        const imgArr = Array.isArray(product.image) ? product.image : product.image ? [product.image] : [];
        const mainImg = imgArr[0] || "";

        if (token) {
            try {
                await cartApi.addToCart(productIdVal, 1, {
                    title: product.title,
                    price: product.price,
                    category: product.category,
                    image: imgArr,
                    brand: product.brand,
                });
                setIsIncart(true);
                dispatchCartUpdate();

                showAlert({
                    title: "Added to Cart!",
                    description: `${product.title} has been added to your shopping cart.`,
                    status: "success",
                    duration: 2500,
                });
            } catch (err: any) {
                console.error("Failed to add to database cart:", err);
                showAlert({
                    title: "Failed to Add to Cart",
                    description: err.response?.data?.message || err.message,
                    status: "error",
                });
            }
        } else {
            try {
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
                    description: product.description,
                });
                setIsIncart(true);
                dispatchCartUpdate();

                showAlert({
                    title: "Added to Cart!",
                    description: `${product.title} has been added to your local cart.`,
                    status: "success",
                    duration: 2500,
                });
            } catch (err) {
                console.error("Failed to add to cart:", err);
            }
        }
    };

    const handleToggleFavourite = async () => {
        const pid = product?._id || product?.id;
        if (!pid || !product) return;

        if (!token) {
            const { isFavourite: nextFav } = toggleLocalFavourite(product);
            setIsFavourite(nextFav);

            showAlert({
                title: nextFav ? "Added to Wishlist!" : "Removed from Wishlist",
                description: nextFav
                    ? `${product?.title || "Item"} has been saved to your favourites.`
                    : `${product?.title || "Item"} was removed from your favourites.`,
                status: nextFav ? "success" : "info",
                duration: 2500,
            });
            return;
        }

        try {
            setFavLoading(true);
            await productRepository.postFavouriteProductsByUserId(pid, userId || undefined);
            const nextFav = !isFavourite;
            setIsFavourite(nextFav);
            window.dispatchEvent(new Event("favourite-updated"));

            showAlert({
                title: nextFav ? "Added to Wishlist!" : "Removed from Wishlist",
                description: nextFav
                    ? `${product?.title || "Item"} has been saved to your favourites.`
                    : `${product?.title || "Item"} was removed from your favourites.`,
                status: nextFav ? "success" : "info",
                duration: 2500,
            });
        } catch (err: any) {
            showAlert({
                title: "Action Failed",
                description: err.response?.data?.message || "Could not update favourite status.",
                status: "error",
            });
        } finally {
            setFavLoading(false);
        }
    };

    useEffect(() => {
        if (!product) return;
        const productIdVal = product._id || product.id;

        if (token) {
            cartApi.getCart()
                .then((res) => {
                    const exists = res.cart?.some(
                        (item) => item.productId === productIdVal || item._id === productIdVal
                    );
                    setIsIncart(!!exists);
                })
                .catch(() => setIsIncart(false));

            productRepository.getFavouriteProducts(userId || undefined)
                .then((res) => {
                    if (res && res.data && Array.isArray(res.data)) {
                        const isFav = res.data.some(
                            (item) => (item._id || item.id) === productIdVal
                        );
                        setIsFavourite(isFav);
                    }
                })
                .catch(() => { });
        } else {
            const cart = getLocalCart();
            const exists = cart.some((item) => item.id === productIdVal || item.productId === productIdVal);
            setIsIncart(exists);
            setIsFavourite(isLocalFavourite(productIdVal));
        }
    }, [product, token]);

    useEffect(() => {
        const checkCartStatus = () => {
            if (!product) return;
            const productIdVal = product._id || product.id;
            if (!token) {
                const cart = getLocalCart();
                const exists = cart.some((item) => item.id === productIdVal || item.productId === productIdVal);
                setIsIncart(exists);
            }
        };

        window.addEventListener("storage", checkCartStatus);
        window.addEventListener("cart-updated", checkCartStatus);
        return () => {
            window.removeEventListener("storage", checkCartStatus);
            window.removeEventListener("cart-updated", checkCartStatus);
        };
    }, [product, token]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setShowAllSimilar(false);
        fetchProductById();
    }, [productId]);

    if (loading) {
        return (
            <Flex
                width="100%"
                minH="400px"
                justify="center"
                align="center"
            >
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (!product) {
        return (
            <Flex
                width="100%"
                minH="400px"
                justify="center"
                align="center"
            >
                <Text fontSize="xl">Product not found</Text>
            </Flex>
        );
    }

    return (
        <Container maxW="1440px" py={{ base: 6, md: 10 }} px={{ base: 4, md: 8 }}>
            <HStack mb={6} spacing={3}>
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft size={16} />}
                    onClick={() => navigate("/Shopio")}
                    color={backBtnColor}
                    borderRadius="full"
                    px={4}
                    _hover={{ bg: backBtnHoverBg, color: "red.500", transform: "translateX(-2px)" }}
                    transition="all 0.2s ease"
                >
                    Back to Products
                </Button>
            </HStack>

            <Flex
                width="100%"
                bg={cardBg}
                borderRadius="3xl"
                p={{ base: 5, md: 10 }}
                gap={{ base: 8, md: 12 }}
                direction={{ base: "column", lg: "row" }}
                boxShadow="0 20px 45px -15px rgba(0, 0, 0, 0.07)"
                border="1px solid"
                borderColor={cardBorder}
            >
                {/* LEFT SIDE - PRODUCT IMAGE STUDIO STAGE */}
                <Flex
                    width={{ base: "100%", lg: "50%" }}
                    direction="column"
                    justify="center"
                    align="center"
                    minH={{ base: "280px", sm: "380px", md: "500px" }}
                    borderRadius="2xl"
                    bg={studioBg}
                    border="1px solid"
                    borderColor={cardBorder}
                    p={{ base: 6, md: 10 }}
                    position="relative"
                    overflow="hidden"
                    boxShadow="inset 0 0 40px rgba(0, 0, 0, 0.02)"
                >
                    <Image
                        src={getProductImageUrl(product.image)}
                        alt={product.title}
                        maxW="100%"
                        maxH={{ base: "280px", md: "460px" }}
                        objectFit="contain"
                        fallbackSrc="https://via.placeholder.com/400x400?text=No+Image"
                        transition="transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                        _hover={{ transform: "scale(1.05)" }}
                    />
                </Flex>

                {/* RIGHT SIDE - PRODUCT DETAILS */}
                <Flex
                    width={{ base: "100%", lg: "50%" }}
                    direction="column"
                    justify="center"
                >
                    <VStack align="stretch" spacing={5}>
                        {/* Badges Bar */}
                        <HStack spacing={2} wrap="wrap">
                            {product.category && (
                                <Badge
                                    bg="red.50"
                                    color="red.600"
                                    px={3.5}
                                    py={1.5}
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    letterSpacing="wider"
                                    textTransform="uppercase"
                                    border="1px solid"
                                    borderColor="red.100"
                                >
                                    {product.category}
                                </Badge>
                            )}

                            {product.status && (
                                <HStack
                                    spacing={1.5}
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    bg={product.status === "Available" ? "emerald.50" : "red.50"}
                                    border="1px solid"
                                    borderColor={product.status === "Available" ? "green.200" : "red.200"}
                                >
                                    <Box
                                        w={2}
                                        h={2}
                                        borderRadius="full"
                                        bg={product.status === "Available" ? "green.500" : "red.500"}
                                    />
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color={product.status === "Available" ? "green.700" : "red.600"}
                                    >
                                        {product.status}
                                    </Text>
                                </HStack>
                            )}
                        </HStack>

                        {/* Title */}
                        <Heading
                            as="h1"
                            fontSize={{ base: "2xl", md: "3xl" }}
                            fontWeight="800"
                            color={headingColor}
                            lineHeight="1.3"
                            letterSpacing="-0.02em"
                        >
                            {product.title}
                        </Heading>

                        {/* Brand & Rating Bar */}
                        <HStack spacing={4} wrap="wrap">
                            {product.brand && (
                                <Text fontSize="sm" color={mutedColor}>
                                    Brand:{" "}
                                    <Text as="span" fontWeight="700" color={headingColor}>
                                        {product.brand}
                                    </Text>
                                </Text>
                            )}

                            {product.rating && (
                                <HStack
                                    spacing={1.5}
                                    bg="amber.50"
                                    color="amber.800"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    border="1px solid"
                                    borderColor="amber.200"
                                    fontSize="xs"
                                    fontWeight="bold"
                                >
                                    <Star size={13} fill="#d97706" color="#d97706" />
                                    <Text>{product.rating.rate}</Text>
                                    <Text color="gray.500" fontWeight="normal">
                                        ({product.rating.count} reviews)
                                    </Text>
                                </HStack>
                            )}
                        </HStack>

                        {/* Price Card */}
                        <Box
                            p={4}
                            borderRadius="2xl"
                            bg={priceBoxBg}
                            border="1px solid"
                            borderColor={priceBoxBorder}
                        >
                            <HStack spacing={3} align="baseline">
                                <Text
                                    fontSize={{ base: "3xl", md: "4xl" }}
                                    fontWeight="900"
                                    bgGradient="linear(to-r, red.500, red.400)"
                                    bgClip="text"
                                    letterSpacing="-0.02em"
                                >
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </Text>
                                <Badge colorScheme="green" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="2xs">
                                    FREE DELIVERY
                                </Badge>
                            </HStack>
                            <Text fontSize="xs" color={mutedColor} mt={1}>
                                Inclusive of all taxes. Free expedited delivery on orders over ₹499.
                            </Text>
                        </Box>

                        {/* Description */}
                        <Box>
                            <Text fontWeight="700" fontSize="sm" textTransform="uppercase" letterSpacing="wider" color={mutedColor} mb={2}>
                                Overview
                            </Text>
                            <Text color={textColor} lineHeight="1.75" fontSize="md">
                                {product.description}
                            </Text>
                        </Box>

                        <Divider borderColor={dividerColor} />

                        {/* Trust Guarantees */}
                        <SimpleGrid columns={{ base: 3 }} spacing={3} py={1}>
                            <VStack
                                p={3}
                                bg={guaranteeBoxBg}
                                borderRadius="xl"
                                align="center"
                                spacing={1}
                                border="1px solid"
                                borderColor={guaranteeBoxBorder}
                            >
                                <Truck size={20} color="#e53e3e" />
                                <Text fontSize="2xs" fontWeight="700" color={headingColor} textAlign="center">
                                    Fast Shipping
                                </Text>
                            </VStack>
                            <VStack
                                p={3}
                                bg={guaranteeBoxBg}
                                borderRadius="xl"
                                align="center"
                                spacing={1}
                                border="1px solid"
                                borderColor={guaranteeBoxBorder}
                            >
                                <ShieldCheck size={20} color="#e53e3e" />
                                <Text fontSize="2xs" fontWeight="700" color={headingColor} textAlign="center">
                                    100% Genuine
                                </Text>
                            </VStack>
                            <VStack
                                p={3}
                                bg={guaranteeBoxBg}
                                borderRadius="xl"
                                align="center"
                                spacing={1}
                                border="1px solid"
                                borderColor={guaranteeBoxBorder}
                            >
                                <RotateCcw size={20} color="#e53e3e" />
                                <Text fontSize="2xs" fontWeight="700" color={headingColor} textAlign="center">
                                    7-Day Return
                                </Text>
                            </VStack>
                        </SimpleGrid>

                        {/* Action Buttons */}
                        <Flex
                            gap={3}
                            pt={2}
                            align="center"
                            direction={{ base: "column", sm: "row" }}
                            w="100%"
                        >
                            <Flex gap={3} flex={1} w={{ base: "100%", sm: "auto" }}>
                                {isIncart ? (
                                    <Button
                                        colorScheme="green"
                                        size="lg"
                                        flex={1}
                                        h="54px"
                                        borderRadius="xl"
                                        fontWeight="700"
                                        leftIcon={<ShoppingBag size={20} />}
                                        onClick={() => navigate("/Shopio/cart")}
                                        boxShadow="0 10px 20px -5px rgba(56, 161, 105, 0.4)"
                                        _hover={{
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 14px 25px -5px rgba(56, 161, 105, 0.5)",
                                        }}
                                        transition="all 0.2s ease"
                                    >
                                        Go to Cart
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        flex={1}
                                        h="54px"
                                        borderRadius="xl"
                                        fontWeight="700"
                                        bgGradient="linear(135deg, #e53e3e 0%, #c53030 100%)"
                                        color="white"
                                        leftIcon={<ShoppingBag size={20} />}
                                        onClick={handleAddtocart}
                                        boxShadow="0 10px 20px -5px rgba(229, 62, 62, 0.4)"
                                        _hover={{
                                            bgGradient: "linear(135deg, #c53030 0%, #9b2c2c 100%)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 14px 25px -5px rgba(229, 62, 62, 0.5)",
                                        }}
                                        _active={{ transform: "translateY(0)" }}
                                        transition="all 0.2s ease"
                                    >
                                        Add to Cart
                                    </Button>
                                )}
                            </Flex>

                            {/* Wishlist Heart Button */}
                            <Tooltip label={isFavourite ? "Remove from Wishlist" : "Add to Wishlist"} hasArrow>
                                <IconButton
                                    aria-label="Wishlist toggle"
                                    icon={
                                        <Heart
                                            size={22}
                                            fill={isFavourite ? "#e53e3e" : "transparent"}
                                            color={isFavourite ? "#e53e3e" : "#64748b"}
                                        />
                                    }
                                    size="lg"
                                    h="54px"
                                    w={{ base: "100%", sm: "54px" }}
                                    variant="outline"
                                    borderColor={isFavourite ? "red.200" : "gray.200"}
                                    bg={isFavourite ? "red.50" : "white"}
                                    borderRadius="xl"
                                    isLoading={favLoading}
                                    onClick={handleToggleFavourite}
                                    _hover={{
                                        bg: "red.50",
                                        borderColor: "red.300",
                                        transform: "translateY(-2px)",
                                    }}
                                    transition="all 0.2s ease"
                                />
                            </Tooltip>
                        </Flex>
                    </VStack>
                </Flex>
            </Flex>

            {/* SIMILAR PRODUCTS SECTION */}
            {similarProducts.length > 0 && (
                <Box mt={{ base: 10, md: 16 }}>
                    <Flex
                        direction={{ base: "column", sm: "row" }}
                        justify="space-between"
                        align={{ base: "flex-start", sm: "flex-end" }}
                        mb={6}
                        gap={2}
                    >
                        <Box>
                            <HStack spacing={2} mb={1}>
                                <Box p={1.5} bg="red.50" color="red.600" borderRadius="md">
                                    <Sparkles size={18} />
                                </Box>
                                <Heading
                                    as="h2"
                                    fontSize={{ base: "xl", md: "2xl" }}
                                    fontWeight="800"
                                    color="gray.900"
                                    letterSpacing="-0.02em"
                                >
                                    Similar Products
                                </Heading>
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                                Customers who viewed this item also loved these handpicked items
                            </Text>
                        </Box>
                        {/* {similarProducts.length > 4 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                rightIcon={showAllSimilar ? <ChevronUp size={16} /> : <ArrowRight size={16} />}
                                onClick={() => setShowAllSimilar((prev) => !prev)}
                                fontWeight="700"
                            >
                                {showAllSimilar ? "Show Less" : `View All (${similarProducts.length})`}
                            </Button>
                        )} */}
                    </Flex>

                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                        {(showAllSimilar ? similarProducts : similarProducts.slice(0, 4)).map((item) => (
                            <Box
                                key={item._id || item.id}
                                bg={cardBg}
                                borderRadius="2xl"
                                p={4}
                                boxShadow="0 4px 20px -5px rgba(0, 0, 0, 0.05)"
                                border="1px solid"
                                borderColor={cardBorder}
                                transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                                cursor="pointer"
                                onClick={() => {
                                    navigate(`/Shopio/product/${item._id || item.id}`);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                _hover={{
                                    transform: "translateY(-6px)",
                                    boxShadow: "0 16px 32px -10px rgba(0, 0, 0, 0.16)",
                                    borderColor: "red.300",
                                }}
                                position="relative"
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-between"
                            >
                                <Box>
                                    {/* Studio Image Frame */}
                                    <Box
                                        w="100%"
                                        aspectRatio="1 / 1"
                                        maxW="800px"
                                        maxH="800px"
                                        bg={studioBg}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor={cardBorder}
                                        p={4}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        overflow="hidden"
                                        mb={3}
                                    >
                                        <Image
                                            src={getProductImageUrl(item.image)}
                                            alt={item.title}
                                            w="100%"
                                            h="100%"
                                            maxH="100%"
                                            maxW="100%"
                                            objectFit="contain"
                                            fallbackSrc="https://via.placeholder.com/800x800?text=No+Image"
                                            transition="transform 0.4s ease"
                                            _hover={{ transform: "scale(1.08)" }}
                                        />
                                    </Box>

                                    {/* Category & Status */}
                                    <HStack justify="space-between" mb={2}>
                                        {item.category && (
                                            <Badge
                                                bg="red.50"
                                                color="red.600"
                                                fontSize="2xs"
                                                fontWeight="bold"
                                                borderRadius="full"
                                                px={2.5}
                                                py={0.5}
                                            >
                                                {item.category}
                                            </Badge>
                                        )}
                                        {item.rating && (
                                            <HStack spacing={1} fontSize="xs" fontWeight="bold" color="amber.700">
                                                <Star size={12} fill="#d97706" color="#d97706" />
                                                <Text>{item.rating.rate}</Text>
                                            </HStack>
                                        )}
                                    </HStack>

                                    {/* Title */}
                                    <Text
                                        fontWeight="700"
                                        fontSize="sm"
                                        color={headingColor}
                                        noOfLines={2}
                                        lineHeight="1.4"
                                        mb={2}
                                        title={item.title}
                                        _hover={{ color: "red.400" }}
                                        transition="color 0.2s ease"
                                    >
                                        {item.title}
                                    </Text>
                                </Box>

                                {/* Price & CTA */}
                                <Box pt={2} borderTop="1px solid" borderColor={dividerColor}>
                                    <HStack justify="space-between" align="baseline" mb={3}>
                                        <Text
                                            fontSize="lg"
                                            fontWeight="900"
                                            bgGradient="linear(to-r, red.500, red.400)"
                                            bgClip="text"
                                        >
                                            ₹{Number(item.price).toLocaleString("en-IN")}
                                        </Text>
                                        <Badge colorScheme="green" variant="subtle" fontSize="2xs" borderRadius="md" px={1.5}>
                                            Free Delivery
                                        </Badge>
                                    </HStack>

                                    {/* <Button
                                        size="sm"
                                        w="100%"
                                        h="38px"
                                        borderRadius="xl"
                                        fontWeight="700"
                                        bgGradient="linear(135deg, #e53e3e 0%, #c53030 100%)"
                                        color="white"
                                        leftIcon={<ShoppingBag size={15} />}
                                        onClick={(e) => handleSimilarAddToCart(item, e)}
                                        _hover={{
                                            bgGradient: "linear(135deg, #c53030 0%, #9b2c2c 100%)",
                                            boxShadow: "0 6px 15px -3px rgba(229, 62, 62, 0.4)",
                                        }}
                                        transition="all 0.2s ease"
                                    >
                                        Add to Cart
                                    </Button> */}
                                </Box>
                            </Box>
                        ))}
                    </SimpleGrid>

                    {/* View All Products Button / Icon After Grid */}
                    {similarProducts.length > 4 && (
                        <Flex justify="center" mt={8}>
                            <Button
                                size="md"
                                variant="outline"
                                colorScheme="red"
                                borderColor="red.300"
                                color="red.600"
                                bg={cardBg}
                                px={6}
                                py={5}
                                borderRadius="full"
                                fontWeight="700"
                                boxShadow="0 4px 14px 0 rgba(229, 62, 62, 0.12)"
                                _hover={{
                                    bg: "red.500",
                                    color: "white",
                                    borderColor: "red.500",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 6px 20px 0 rgba(229, 62, 62, 0.25)",
                                }}
                                _active={{
                                    transform: "translateY(0)",
                                }}
                                transition="all 0.2s ease"
                                leftIcon={showAllSimilar ? <ChevronUp size={18} /> : <LayoutGrid size={18} />}
                                rightIcon={showAllSimilar ? undefined : <ChevronDown size={18} />}
                                onClick={() => setShowAllSimilar((prev) => !prev)}
                            >
                                {showAllSimilar
                                    ? "Show Less Products"
                                    : `View More Products (${similarProducts.length})`}
                            </Button>
                        </Flex>
                    )}
                </Box>
            )}
        </Container>
    );
}