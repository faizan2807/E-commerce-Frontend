import {
    Box,
    Text,
    Flex,
    Button,
    Image,
    Divider,
    Container,
    HStack,
    VStack,
    Badge,
    Spinner,
    SimpleGrid,
    IconButton,
    Tooltip,
    useColorModeValue,

} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import {
    Truck,
    ShieldCheck,
    Headphones,
    Sparkles,
    Star,
    ArrowRight,
    Heart,
    Flame,
} from "lucide-react";
import Carousel from "../../closure/closure";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import Card from "../../card/card";
import Products from "../../products/product";
import FestiveDealsSection from "./FestiveDealsSection";
import { ProductsTableData, productRepository, getTrendingProducts } from "../../../../api/product";
import { getProductImageUrl } from "../../../../utils/imageUtils";
import { useAuth } from "../../../../context/AuthContext";
import { useCenterAlert } from "../../../../context/AlertContext";
import { toggleLocalFavourite, getLocalFavouriteIds } from "../../../../utils/favouriteStorage";
import { keyframes } from "@emotion/react";

export interface HomeOutletContext {
    selectedCategory: string;
    products: ProductsTableData[];
    loading: boolean;
    handleCategoryClick: (category: string) => Promise<void>;
    handleClearCategory: () => void;
}

const shineSweep = keyframes`
  0% {
    left: -130%;
  }
  30%, 100% {
    left: 140%;
  }
`;

const shineGlow = keyframes`
  0%, 100% {
    box-shadow: 0 4px 14px rgba(0, 0, 128, 0.25);
    transform: translateY(0);
  }
  15% {
    box-shadow: 0 4px 20px rgba(96, 165, 250, 0.6), 0 0 12px rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
  30% {
    box-shadow: 0 4px 14px rgba(0, 0, 128, 0.25);
    transform: translateY(0);
  }
`;

export default function HomeShowcase() {
    const { token, userId } = useAuth();
    const { showAlert } = useCenterAlert();
    const navigate = useNavigate();
    const context = useOutletContext<HomeOutletContext>();

    const selectedCategory = context?.selectedCategory ?? "";
    const products = context?.products ?? [];
    const loading = context?.loading ?? false;
    const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
    const [trendingProducts, setTrendingProducts] = useState<ProductsTableData[]>([]);
    const [trendingLoading, setTrendingLoading] = useState<boolean>(true);

    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.200", "blue.800");
    const headingColor = useColorModeValue("gray.900", "white");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const stageBg = useColorModeValue("radial-gradient(ellipse at center, #ffffff 0%, #f8fafc 100%)", "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)");
    const trustHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
    const ratingBg = useColorModeValue("#fffbeb", "rgba(245, 158, 11, 0.12)");
    const ratingBorder = useColorModeValue("#fef3c7", "rgba(245, 158, 11, 0.25)");
    const ratingTextColor = useColorModeValue("#b45309", "#fbbf24");

    useEffect(() => {
        const syncFavIds = () => {
            if (token) {
                productRepository.getFavouriteProducts(userId || undefined)
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

    useEffect(() => {
        const loadTrending = async () => {
            try {
                setTrendingLoading(true);
                const res: any = await getTrendingProducts(8);
                const data = res?.data ?? res?.products ?? (Array.isArray(res) ? res : []);
                if (Array.isArray(data)) {
                    setTrendingProducts(data);
                }
            } catch (err) {
                console.error("Failed to load trending products:", err);
            } finally {
                setTrendingLoading(false);
            }
        };
        loadTrending();
    }, []);

    const handleToggleFavourite = async (
        e: React.MouseEvent,
        productId: string,
        title: string,
        productItem?: ProductsTableData
    ) => {
        e.stopPropagation();

        if (!token) {
            const targetProduct = productItem || products.find((p) => (p._id || p.id) === productId);
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
        }
    };
    const handleClearCategory = context?.handleClearCategory ?? (() => { });

    const images = [
        // "/assets/carsoul1.jpg",
        //"/assets/carsoul2.jpg",
        "/assets/carsoul3.jpg",
    ];

    const cards = [
        {
            id: 1,
            title: "Electronic Appliances",
            description: "Smart front-load & top-load energy efficient washing machines.",
            category: "Electronic",
            Image: "/assets/washing machine.jpg",
            iconBg: "white",
            badge: "Appliances",
            badgeColor: "blue",
            bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
        },
        {
            id: 2,
            title: "Fashion & Accessories",
            description: "Trendy clothing, footwear, luxury watches and daily fashion wear.",
            category: "Fashion",
            Image: "/assets/cloths.jpg",
            iconBg: "white",
            badge: "Fashion & Style",
            badgeColor: "purple",
            bgGradient: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
        },
        {
            id: 3,
            title: "Home & Furniture",
            description: "Aesthetic furniture, ambient lighting & luxury home living.",
            category: "Home",
            Image: "/assets/home-decor.jpg",
            iconBg: "white",
            badge: "Home & Living",
            badgeColor: "orange",
            bgGradient: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
        },
        {
            id: 4,
            title: "Beauty Products",
            description: "Curated skincare, luxury cosmetics, personal care & fragrances.",
            category: "Beauty",
            Image: "/assets/beauty.jpg",
            iconBg: "white",
            badge: "Beauty & Care",
            badgeColor: "pink",
            bgGradient: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
        },
    ];

    return (
        <Box w="100%">
            {/* Carousel Container */}
            <Container maxW="1920px" px={{ base: 3, md: 6, lg: 8 }} pt={{ base: 3, md: 5 }}>
                <Box
                    borderRadius={{ base: "xl", md: "2xl" }}
                    overflow="hidden"
                    boxShadow="0 10px 30px -5px rgba(0, 0, 0, 0.1)"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    maxW="1920px"
                    mx="auto"
                >
                    <Carousel images={images} />
                </Box>
            </Container>

            {/* Trust & Guarantee Strip */}
            <Container maxW="1480px" px={{ base: 3, md: 6, lg: 8 }} mt={6}>
                <SimpleGrid
                    columns={{ base: 2, md: 4 }}
                    spacing={{ base: 3, md: 4 }}
                    bg={cardBg}
                    p={{ base: 4, md: 5 }}
                    borderRadius="25px"
                    boxShadow="0 4px 20px -2px rgba(0, 0, 0, 0.05)"
                    border="1px solid"
                    borderColor={cardBorder}
                >
                    <HStack
                        spacing={3}
                        p={2} borderRadius="50px"
                        transition="all 0.2s"
                        _hover={{ bg: trustHoverBg }}
                        borderColor={cardBorder}
                        border={"1px solid"}

                    >
                        <Box
                            p={2.5}
                            bg="red.50"
                            color="red.600"
                            borderRadius={"xl"}
                            flexShrink={0}
                            boxShadow="0 2px 8px rgba(229, 62, 62, 0.15)"
                        >
                            <Truck size={20} />
                        </Box>
                        <Box>
                            <Text fontWeight="bold" fontSize="sm" color={headingColor}>
                                Free Delivery
                            </Text>
                            <Text fontSize="xs" color={subTextColor}>
                                On all orders over ₹499
                            </Text>
                        </Box>
                    </HStack>

                    <HStack
                        spacing={3}
                        p={2} borderRadius="50px"
                        transition="all 0.2s"
                        _hover={{ bg: trustHoverBg }}
                        borderColor={cardBorder}
                        border={"1px solid"}
                    >
                        <Box
                            p={2.5}
                            bg="green.50"
                            color="green.600"
                            borderRadius="xl"
                            flexShrink={0}
                            boxShadow="0 2px 8px rgba(34, 197, 94, 0.15)"
                        >
                            <ShieldCheck size={20} />
                        </Box>
                        <Box>
                            <Text fontWeight="bold" fontSize="sm" color={headingColor}>
                                100% Genuine
                            </Text>
                            <Text fontSize="xs" color={subTextColor}>
                                Certified authentic products
                            </Text>
                        </Box>
                    </HStack>

                    <HStack
                        spacing={3}
                        p={2} borderRadius="50px"
                        transition="all 0.2s"
                        _hover={{ bg: trustHoverBg }}
                        borderColor={cardBorder}
                        border={"1px solid"}
                    >
                        <Box
                            p={2.5}
                            bg="blue.50"
                            color="blue.600"
                            borderRadius="xl"
                            flexShrink={0}
                            boxShadow="0 2px 8px rgba(59, 130, 246, 0.15)"
                        >
                            <Sparkles size={20} />
                        </Box>
                        <Box>
                            <Text fontWeight="bold" fontSize="sm" color={headingColor}>
                                Best Offers
                            </Text>
                            <Text fontSize="xs" color={subTextColor}>
                                Exclusive member deals
                            </Text>
                        </Box>
                    </HStack>

                    <HStack
                        spacing={3}
                        p={2} borderRadius="50px"
                        transition="all 0.2s"
                        _hover={{ bg: trustHoverBg }}
                        borderColor={cardBorder}
                        border={"1px solid"}
                    >
                        <Box
                            p={2.5}
                            bg="purple.50"
                            color="purple.600"
                            borderRadius="xl"
                            flexShrink={0}
                            boxShadow="0 2px 8px rgba(168, 85, 247, 0.15)"
                        >
                            <Headphones size={20} />
                        </Box>
                        <Box>
                            <Text fontWeight="bold" fontSize="sm" color={headingColor}>
                                24/7 Support
                            </Text>
                            <Text fontSize="xs" color={subTextColor}>
                                Quick expert assistance
                            </Text>
                        </Box>
                    </HStack>
                </SimpleGrid>
            </Container>

            {/* Festive Deals, Spotlight & Popular Showcase (Rendered after Free Shipping / Delivery Strip) */}
            <FestiveDealsSection />

            {/* Promotional AD-Banner Section (After Free Delivery, Best Offers, Support Strip) */}
            <Container maxW="1200px" px={{ base: 3, md: 6, lg: 8 }} mt={6}>
                <Box
                    maxW="1200px"
                    mx="auto"
                    borderRadius={{ base: "xl", md: "2xl" }}
                    overflow="hidden"
                    boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.08)"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    position="relative"
                    cursor="pointer"
                    transition="all 0.3s ease"
                    _hover={{
                        transform: "translateY(-3px)",
                        boxShadow: "0 18px 35px -5px rgba(229, 62, 62, 0.18)",
                        borderColor: "red.200",
                    }}
                    onClick={() => {
                        const el = document.getElementById("all-products-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    <Image
                        src="/assets/laptop.jpg"
                        alt="Special Offers & Mega Discounts"
                        w="100%"
                        maxW="1200px"
                        h={{ base: "140px", sm: "220px", md: "300px", lg: "400px" }}
                        maxH="400px"
                        aspectRatio={{ base: "3/1", md: "1200/400" }}
                        objectFit="cover"
                        objectPosition="center"
                        fallbackSrc="/assets/Ad-banner2.png"
                    />


                    <Box
                        bg={"blue"}
                        position="absolute"
                        top={{ base: 1, sm: 2, md: 3 }}
                        left={{ base: 1, sm: 2, md: 3 }}
                        px={{ base: "5px", md: "10px" }}
                        py={{ base: "2px", md: "4px" }}
                        borderRadius="3xl"
                        boxShadow="0 4px 14px rgba(0, 0, 0, 0.16)"
                        zIndex={2}
                        overflow="hidden"
                        animation={`${shineGlow} 2.8s ease-in-out infinite`}
                        transition="all 0.3s ease"
                        _hover={{
                            transform: "scale(1.08)",
                        }}
                        _after={{
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: "-130%",
                            width: "60%",
                            height: "100%",
                            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent)",
                            transform: "skewX(-25deg)",
                            animation: `${shineSweep} 2.8s ease-in-out infinite`,
                            pointerEvents: "none",
                        }}
                    >
                        <Text
                            position="relative"
                            zIndex={1}
                            fontSize={{ base: "xs", sm: "sm", md: "lg", lg: "xl" }}
                            fontWeight="bold"
                            color="white"

                        >
                            New Arrivals
                        </Text>
                    </Box>
                </Box>
            </Container>

            {/*category product*/}
            {selectedCategory && (
                <Container id="category-results-section" maxW="1480px" px={{ base: 3, md: 3, lg: 4 }} mt={6}>
                    <Flex
                        align="center"
                        justify="space-between"
                        bg="white"
                        px={5}
                        py={3.5}
                        borderRadius="xl"
                        borderLeft="4px solid"
                        borderLeftColor="red.500"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        <HStack spacing={3}>
                            <Text fontSize="sm" color="gray.600">
                                Showing results for category:
                            </Text>
                            <Badge
                                colorScheme="red"
                                fontSize="sm"
                                px={3}
                                py={1}
                                borderRadius="full"
                                textTransform="capitalize"
                            >
                                {selectedCategory}
                            </Badge>
                            {loading && (
                                <HStack spacing={2} ml={2}>
                                    <Spinner size="xs" color="red.500" />
                                    <Text fontSize="xs" color="gray.500">
                                        Loading...
                                    </Text>
                                </HStack>
                            )}
                        </HStack>

                        <Button
                            size="xs"
                            variant="outline"
                            colorScheme="red"
                            rightIcon={<CloseIcon boxSize={2} />}
                            onClick={handleClearCategory}
                            borderRadius="full"
                        >
                            Clear Filter
                        </Button>
                    </Flex>

                    {/* Display Category Filtered Products if fetched */}
                    {!loading && products.length > 0 && (
                        <SimpleGrid
                            columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                            spacing={{ base: 4, md: 5 }}
                            mt={5}
                        >
                            {products.map((product) => {
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
                                        <Tooltip label={isFav ? "Remove from Wishlist" : "Add to Wishlist"} hasArrow>
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
                                        </Box>

                                        {/* Product Details Section */}
                                        <VStack align="stretch" spacing={2.5} p={4} flex="1" bg={cardBg}>
                                            <HStack justify="space-between">
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

                                            <HStack justify="space-between" align="baseline" mt="auto" pt={1}>
                                                <Text fontSize="md" fontWeight="black" color={headingColor}>
                                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                                </Text>
                                                <Text fontSize="2xs" fontWeight="semibold" color="green.400">
                                                    Free Delivery
                                                </Text>
                                            </HStack>

                                            <Button
                                                bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                                                color="white"
                                                size="sm"
                                                borderRadius="xl"
                                                w="100%"
                                                boxShadow="0 2px 8px rgba(229, 62, 62, 0.25)"
                                                transition="all 0.25s ease"
                                                _hover={{
                                                    bg: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                                                    boxShadow: "0 6px 16px -2px rgba(229, 62, 62, 0.4)",
                                                    transform: "translateY(-1px)",
                                                }}
                                                _active={{ transform: "translateY(0)" }}
                                                onClick={() =>
                                                    navigate(`/Shopio/productDetails/${pid}`)
                                                }
                                            >
                                                View Product
                                            </Button>
                                        </VStack>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    )}
                </Container>
            )}

            {/* Featured Highlights Section */}
            <Container maxW="1480px" px={{ base: 3, md: 6, lg: 8 }} mt={{ base: 8, md: 10 }}>
                <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "start", sm: "center" }}
                    mb={6}
                    gap={2}
                >
                    <Box>
                        <Badge colorScheme="red" px={2.5} py={0.5} borderRadius="full" mb={1}>
                            POPULAR CATEGORIES
                        </Badge>
                        <Text
                            fontSize={{ base: "xl", md: "2xl" }}
                            fontWeight="black"
                            color="gray.800|| white.200"
                            letterSpacing="-0.5px"
                        >
                            Shop By Category
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            Explore top categories including washing machines, mobiles, home decor & beauty
                        </Text>
                    </Box>

                </Flex>

                {/* Cards Grid */}
                <SimpleGrid
                    columns={{ base: 1, sm: 2, lg: 4 }}
                    spacing={{ base: 4, md: 6 }}
                >
                    {cards.map((card) => (
                        <Card
                            key={card.id}
                            title={card.title}
                            description={card.description}
                            image={card.Image}
                            iconBg={card.iconBg}
                            badge={card.badge}
                            badgeColor={card.badgeColor}
                            bgGradient={card.bgGradient}
                            buttonText="See More"
                            onButtonClick={() => {
                                if (card.category) {
                                    navigate(`/Shopio/category/${encodeURIComponent(card.category)}`);
                                }
                            }}
                        />
                    ))}
                </SimpleGrid>
            </Container>

            {/* Promotional AD-Banner 2 Section (After Popular Categories) */}
            <Container maxW="1200px" px={{ base: 3, md: 6, lg: 8 }} mt={{ base: 8, md: 10 }}>
                <Box
                    maxW="1200px"
                    mx="auto"
                    borderRadius={{ base: "xl", md: "2xl" }}
                    overflow="hidden"
                    boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.08)"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    position="relative"
                    cursor="pointer"
                    transition="all 0.3s ease"
                    _hover={{
                        transform: "translateY(-3px)",
                        boxShadow: "0 18px 35px -5px rgba(229, 62, 62, 0.18)",
                        borderColor: "red.200",
                    }}
                    onClick={() => {
                        const el = document.getElementById("all-products-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    <Image
                        src="/assets/kayboards.jpg"
                        alt="Exclusive Deals & Special Offers"
                        w="100%"
                        maxW="1200px"
                        h={{ base: "140px", sm: "220px", md: "320px", lg: "400px" }}
                        maxH="400px"
                        aspectRatio={{ base: "3/1", md: "1200/400" }}
                        objectFit="cover"
                        objectPosition="center"
                        fallbackSrc="/assets/AD-banner.png"
                    />
                    <Box
                        bg={"gray.200"}
                        position="absolute"
                        top={{ base: 1, sm: 2, md: 3 }}
                        left={{ base: 1, sm: 2, md: 3 }}
                        px={{ base: "5px", md: "10px" }}
                        py={{ base: "2px", md: "4px" }}
                        borderRadius="md"
                        boxShadow="0 4px 14px rgba(0, 0, 0, 0.16)"
                        zIndex={2}
                        overflow="hidden"
                        transition="all 0.3s ease"
                        _hover={{
                            transform: "scale(1.08)",
                        }}
                        _after={{
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: "-130%",
                            width: "60%",
                            height: "100%",
                            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent)",
                            transform: "skewX(-25deg)",
                            animation: `${shineSweep} 2.8s ease-in-out infinite`,
                            pointerEvents: "none",
                        }}
                    >
                        <Text
                            position="relative"
                            zIndex={1}
                            fontSize={{ base: "xs", sm: "sm", md: "lg", lg: "xl" }}

                            color="black"

                        >
                            AD
                        </Text>
                    </Box>
                </Box>
            </Container>

            <Divider
                borderColor="gray.200"
                maxW="1480px"
                mx="auto"
                my={{ base: 8, md: 12 }}
            />

            {/* Main Products Catalogue Section */}
            <Container id="all-products-section" maxW="1480px" px={{ base: 3, md: 6, lg: 8 }}>
                <Box mb={6}>
                    <Badge colorScheme="blue" px={2.5} py={0.5} borderRadius="full" mb={1}>
                        EXPLORE CATALOGUE
                    </Badge>
                    <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="black"
                        color="gray.800 || white.200"
                        letterSpacing="-0.5px"
                    >
                        Trending Products
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Handpicked items from top sellers with instant dispatch
                    </Text>
                </Box>

                {/* Products Component */}
                <Box
                    w="100%"
                    bg={cardBg}
                    p={{ base: 3, sm: 5, md: 6 }}
                    boxShadow="sm"
                >
                    {trendingLoading ? (
                        <Flex justify="center" align="center" minH="200px">
                            <Spinner size="lg" color="red.500" />
                        </Flex>
                    ) : (
                        <SimpleGrid
                            columns={{ base: 2, sm: 3, md: 4, lg: 4 }}
                            spacing={{ base: 4, md: 6 }}
                        >
                            {trendingProducts.map((product) => {
                                const pid = product._id || product.id;
                                return (
                                    <Box
                                        key={pid}
                                        cursor="pointer"
                                        role="group"
                                        textAlign="center"
                                        onClick={() => navigate(`/Shopio/productDetails/${pid}`)}
                                        transition="transform 0.3s ease"
                                        _hover={{ transform: "translateY(-4px)" }}
                                    >
                                        {/* Product Image Stage */}
                                        <Box
                                            w="100%"
                                            aspectRatio="1 / 1"
                                            maxW="800px"
                                            maxH="800px"
                                            bg={stageBg}
                                            borderRadius="2xl"
                                            p={4}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            overflow="hidden"
                                            mb={3}
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            boxShadow="0 4px 14px -2px rgba(0, 0, 0, 0.05)"
                                            transition="all 0.3s ease"
                                            _groupHover={{
                                                borderColor: "red.300",
                                                boxShadow: "0 12px 24px -6px rgba(0, 0, 0, 0.12)",
                                            }}
                                        >
                                            <Image
                                                src={getProductImageUrl(product.image)}
                                                alt={product.title}
                                                w="100%"
                                                h="100%"
                                                maxW="100%"
                                                maxH="100%"
                                                objectFit="contain"
                                                transition="transform 0.4s ease"
                                                _groupHover={{ transform: "scale(1.08)" }}
                                                fallbackSrc="https://via.placeholder.com/800x800?text=No+Image"
                                            />
                                        </Box>

                                        {/* Product Title */}
                                        <Text
                                            fontWeight="bold"
                                            fontSize="sm"
                                            noOfLines={2}
                                            color={headingColor}
                                            lineHeight="1.4"
                                            px={1}
                                            transition="color 0.2s"
                                            _groupHover={{ color: "red.500" }}
                                        >
                                            {product.title}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    )}
                </Box>
            </Container>
        </Box>
    );
}
