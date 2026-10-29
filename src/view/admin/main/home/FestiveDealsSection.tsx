import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Text,
    Flex,
    Image,
    HStack,
    VStack,
    SimpleGrid,
    IconButton,
    Container,
    useColorModeValue,
    Skeleton,
} from "@chakra-ui/react";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAppProduct, ProductsTableData } from "../../../../api/product";
import { getProductImageUrl } from "../../../../utils/imageUtils";

const FestiveGarlandBorder = ({ lightCount = 28 }: { lightCount?: number }) => {
    return (
        <Box w="100%" h="22px" position="relative" overflow="hidden" pointerEvents="none">

            <svg
                width="100%"
                height="22"
                viewBox="0 0 1000 22"
                preserveAspectRatio="none"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            >
                <path
                    d="M0,4 Q25,14 50,4 Q75,14 100,4 Q125,14 150,4 Q175,14 200,4 Q225,14 250,4 Q275,14 300,4 Q325,14 350,4 Q375,14 400,4 Q425,14 450,4 Q475,14 500,4 Q525,14 550,4 Q575,14 600,4 Q625,14 650,4 Q675,14 700,4 Q725,14 750,4 Q775,14 800,4 Q825,14 850,4 Q875,14 900,4 Q925,14 950,4 Q975,14 1000,4"
                    fill="none"
                    stroke="rgba(255, 235, 150, 0.55)"
                    strokeWidth="1.2"
                />
            </svg>

            {/* Glowing Bulbs */}
            <Flex justify="space-around" align="center" px={2} pt="5px" position="relative" zIndex={1}>
                {Array.from({ length: lightCount }).map((_, idx) => {
                    const isAlt = idx % 2 === 0;
                    const glowColor = isAlt ? "rgba(255, 240, 140, 0.95)" : "rgba(255, 255, 255, 0.9)";
                    const shadowColor = isAlt ? "rgba(245, 158, 11, 0.85)" : "rgba(254, 240, 138, 0.8)";
                    return (
                        <Box
                            key={idx}
                            w={{ base: "5px", md: "7px" }}
                            h={{ base: "5px", md: "7px" }}
                            borderRadius="full"
                            bg={glowColor}
                            boxShadow={`0 0 6px 2px ${shadowColor}, 0 0 12px 4px rgba(251, 191, 36, 0.4)`}
                            transition="all 0.3s ease"
                        />
                    );
                })}
            </Flex>
        </Box>
    );
};

export default function FestiveDealsSection() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appProducts, setAppProducts] = useState<ProductsTableData[]>([]);
    const spotlightScrollRef = useRef<HTMLDivElement>(null);

    // Color mode values
    const cardBg = useColorModeValue("white", "#111827");
    const innerCardBg = useColorModeValue("#f8fafc", "#1f2937");
    const innerCardBorder = useColorModeValue("#e2e8f0", "#374151");
    const headingColor = useColorModeValue("gray.900", "white");
    const subTextColor = useColorModeValue("gray.700", "gray.300");
    const dealTextColor = useColorModeValue("gray.900", "white");

    // Fetch products using getAppProduct from product.ts
    useEffect(() => {
        const loadAppProducts = async () => {
            try {
                setLoading(true);
                const res = await getAppProduct({ limit: 20 });
                if (res && res.success && Array.isArray(res.data)) {
                    setAppProducts(res.data);
                }
            } catch (err) {
                console.error("Failed to load app products in FestiveDealsSection:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAppProducts();
    }, []);

    // Filter or match Fashion items
    const fashionProducts = appProducts.filter(
        (p) =>
            p.category?.toLowerCase().includes("fashion") ||
            p.category?.toLowerCase().includes("cloth") ||
            p.title?.toLowerCase().includes("shirt") ||
            p.title?.toLowerCase().includes("jean")
    );

    // Filter or match Electronics / Gadgets for Popular Nearby
    const popularProducts = appProducts.filter(
        (p) =>
            p.category?.toLowerCase().includes("electronic") ||
            p.category?.toLowerCase().includes("watch") ||
            p.category?.toLowerCase().includes("headphone") ||
            p.category?.toLowerCase().includes("shoe")
    );

    // Curated Fallbacks matching reference image 100%
    const fashionDeals = [
        {
            id: fashionProducts[0]?._id || fashionProducts[0]?.id || "fash-1",
            title: fashionProducts[0]?.title || "Men's Shorts",
            image: fashionProducts[0]?.image ? getProductImageUrl(fashionProducts[0].image) : "/assets/cloths.jpg",
            discount: "Min. 50% Off",
            category: "Fashion",
        },
        {
            id: fashionProducts[1]?._id || fashionProducts[1]?.id || "fash-2",
            title: fashionProducts[1]?.title || "Women's Ethnic Sets",
            image: fashionProducts[1]?.image ? getProductImageUrl(fashionProducts[1].image) : "/assets/ayrus-hill-FkNIKhdnnjQ-unsplash.jpg",
            discount: "Min. 50% Off",
            category: "Fashion",
        },
        {
            id: fashionProducts[2]?._id || fashionProducts[2]?.id || "fash-3",
            title: fashionProducts[2]?.title || "Men's Caps",
            image: fashionProducts[2]?.image ? getProductImageUrl(fashionProducts[2].image) : "/assets/reuben-mansell-nwOip8AOZz0-unsplash.jpg",
            discount: "Min. 50% Off",
            category: "Fashion",
        },
        {
            id: fashionProducts[3]?._id || fashionProducts[3]?.id || "fash-4",
            title: fashionProducts[3]?.title || "Men's Sweatshirts",
            image: fashionProducts[3]?.image ? getProductImageUrl(fashionProducts[3].image) : "/assets/cameron-roberson-mVe9UcjlNic-unsplash.jpg",
            discount: "Min. 50% Off",
            category: "Fashion",
        },
    ];

    // Spotlight items
    const spotlightCards = [
        {
            id: "spot-1",
            brand: "boAt",
            name: "ACE 5G",
            tagline: "Endless Power, Every Day.",
            priceTag: "From ₹11,999",
            image: "/assets/boat rockers.jpg",
            bgGradient: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
        },
        {
            id: "spot-2",
            brand: "NOTHING (R)",
            name: "Phone (4b)",
            tagline: "Smooth, strong unibody design",
            priceTag: "From ₹25,999 ₹40,000",
            image: "/assets/oppo find x10 pro.webp",
            bgGradient: "linear-gradient(145deg, #09090b 0%, #18181b 100%)",
        },
        {
            id: "spot-3",
            brand: "ASUS EXPERTBOOK",
            name: "ASUS EXPERTBOOK",
            tagline: "WHEN YOU ZONE-IN, BUILT FOR BRILLIANCE",
            priceTag: "From ₹1,44,490*",
            image: "/assets/laptop.jpg",
            bgGradient: "linear-gradient(145deg, #022c22 0%, #064e3b 100%)",
        },
        {
            id: "spot-4",
            brand: "CMF",
            name: "WATCH SERIES",
            tagline: "Precise tracking with Dual-Band GPS",
            priceTag: "From ₹3,799",
            image: "/assets/smartwatch.jpg",
            bgGradient: "linear-gradient(145deg, #172554 0%, #1e3a8a 100%)",
        },
        {
            id: "spot-5",
            brand: "MIVI",
            name: "Mivi On",
            tagline: "Mivi On 50MP+ Studio Audio",
            priceTag: "Just ₹15,999*",
            image: "/assets/speaker.jpg",
            bgGradient: "linear-gradient(145deg, #312e81 0%, #3730a3 100%)",
        },
    ];

    // Popular nearby items
    const popularNearbyDeals = [
        {
            id: popularProducts[0]?._id || popularProducts[0]?.id || "pop-1",
            title: popularProducts[0]?.title || "Hand-picked",
            dealTag: "Special offer",
            image: popularProducts[0]?.image ? getProductImageUrl(popularProducts[0].image) : "/assets/alexa.jpg",
            category: "Electronic",
        },
        {
            id: popularProducts[1]?._id || popularProducts[1]?.id || "pop-2",
            title: popularProducts[1]?.title || "New Collection",
            dealTag: "Special offer",
            image: popularProducts[1]?.image ? getProductImageUrl(popularProducts[1].image) : "/assets/Apple airpods.jpg",
            category: "Electronic",
        },
        {
            id: popularProducts[2]?._id || popularProducts[2]?.id || "pop-3",
            title: popularProducts[2]?.title || "Best Deal",
            dealTag: "Under ₹469",
            image: popularProducts[2]?.image ? getProductImageUrl(popularProducts[2].image) : "/assets/andrea-donato-lJFLGirYwV0-unsplash.jpg",
            category: "Fashion",
        },
        {
            id: popularProducts[3]?._id || popularProducts[3]?.id || "pop-4",
            title: popularProducts[3]?.title || "Deal of the Day",
            dealTag: "From ₹99",
            image: popularProducts[3]?.image ? getProductImageUrl(popularProducts[3].image) : "/assets/smartwatch.jpg",
            category: "Electronic",
        },
    ];

    const scrollSpotlight = (direction: "left" | "right") => {
        if (spotlightScrollRef.current) {
            const scrollAmount = direction === "left" ? -320 : 320;
            spotlightScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <Container maxW="1480px" px={{ base: 3, md: 6, lg: 8 }} mt={6}>
            <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    overflow="hidden"
                    border="2.5px solid #ea580c"
                    boxShadow="0 8px 24px -4px rgba(234, 88, 12, 0.15)"
                    transition="box-shadow 0.3s ease"
                    _hover={{
                        boxShadow: "0 12px 30px -4px rgba(234, 88, 12, 0.25)",
                    }}
                >
                    {/* Festive Header with Lights Garland */}
                    <Box
                        bg="linear-gradient(90deg, #991b1b 0%, #c2410c 45%, #ea580c 100%)"
                        position="relative"
                        pb={2.5}
                        pt={1}
                        px={{ base: 3, sm: 4, md: 5 }}
                    >
                        <FestiveGarlandBorder lightCount={32} />

                        <Flex align="center" justify="space-between" mt={1}>
                            <HStack spacing={2.5}>
                                <Sparkles size={20} color="#fef08a" />
                                <Text
                                    color="white"
                                    fontWeight="900"
                                    fontSize={{ base: "md", sm: "lg", md: "xl" }}
                                    letterSpacing="-0.3px"
                                    textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
                                >
                                    Best Value Deals on Fashion
                                </Text>
                            </HStack>

                            <IconButton
                                aria-label="View all fashion deals"
                                icon={<ArrowRight size={18} strokeWidth={2.5} />}
                                size="sm"
                                borderRadius="full"
                                bg="white"
                                color="gray.900"
                                boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
                                _hover={{
                                    bg: "orange.50",
                                    transform: "translateX(2px)",
                                }}
                                transition="all 0.2s"
                                onClick={() => navigate("/Shopio/category/Fashion")}
                            />
                        </Flex>
                    </Box>

                    {/* 4 Fashion Deal Cards */}
                    <SimpleGrid
                        columns={{ base: 2, sm: 2, md: 4 }}
                        spacing={{ base: 3, md: 4 }}
                        p={{ base: 3, sm: 4, md: 5 }}
                    >
                        {fashionDeals.map((item, index) => (
                            <Box
                                key={index}
                                bg={innerCardBg}
                                border="1px solid"
                                borderColor={innerCardBorder}
                                borderRadius="xl"
                                p={3}
                                cursor="pointer"
                                transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                                role="group"
                                _hover={{
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 10px 20px -3px rgba(0, 0, 0, 0.1)",
                                    borderColor: "orange.300",
                                }}
                                onClick={() => {
                                    if (item.id && !item.id.startsWith("fash-")) {
                                        navigate(`/Shopio/productDetails/${item.id}`);
                                    } else {
                                        navigate("/Shopio/category/Fashion");
                                    }
                                }}
                            >
                                <Box
                                    w="100%"
                                    h={{ base: "130px", sm: "150px", md: "175px" }}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="white"
                                    borderRadius="lg"
                                    p={2}
                                    mb={3}
                                    overflow="hidden"
                                >
                                    {loading ? (
                                        <Skeleton w="100%" h="100%" borderRadius="lg" />
                                    ) : (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            maxW="100%"
                                            maxH="100%"
                                            objectFit="contain"
                                            transition="transform 0.35s ease"
                                            _groupHover={{ transform: "scale(1.08)" }}
                                            fallbackSrc="/assets/cloths.jpg"
                                        />
                                    )}
                                </Box>

                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color={subTextColor}
                                    noOfLines={1}
                                    mb={0.5}
                                >
                                    {item.title}
                                </Text>

                                <Text
                                    fontSize={{ base: "xs", sm: "sm" }}
                                    fontWeight="800"
                                    color={dealTextColor}
                                    noOfLines={1}
                                >
                                    {item.discount}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>
                <Box position="relative">
                    <HStack justify="space-between" align="center" mb={3}>
                        <Text
                            fontSize={{ base: "lg", md: "2xl" }}
                            fontWeight="800"
                            color={headingColor}
                            letterSpacing="-0.5px"
                        >
                            In The Spotlight
                        </Text>
                    </HStack>
                    <Box position="relative">
                        <Flex
                            ref={spotlightScrollRef}
                            overflowX="auto"
                            gap={{ base: 3, md: 4 }}
                            py={2}
                            px={1}
                            sx={{
                                scrollbarWidth: "none",
                                "&::-webkit-scrollbar": { display: "none" },
                                scrollSnapType: "x mandatory",
                            }}
                        >
                            {spotlightCards.map((card) => (
                                <Box
                                    key={card.id}
                                    flex={{ base: "0 0 240px", sm: "0 0 270px", md: "0 0 285px" }}
                                    scrollSnapAlign="start"
                                    bg={card.bgGradient}
                                    borderRadius="2xl"
                                    overflow="hidden"
                                    boxShadow="0 6px 18px -2px rgba(0, 0, 0, 0.2)"
                                    cursor="pointer"
                                    border="1px solid rgba(255, 255, 255, 0.08)"
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                    h={{ base: "210px", md: "235px" }}
                                    position="relative"
                                    role="group"
                                    transition="all 0.3s ease"
                                    _hover={{
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 14px 28px -4px rgba(0, 0, 0, 0.35)",
                                    }}
                                    onClick={() => navigate("/Shopio")}
                                >
                                    {/* Card Header & Brand info */}
                                    <Box p={3.5} position="relative" zIndex={2}>
                                        <Flex justify="space-between" align="flex-start">
                                            <VStack align="flex-start" spacing={0}>
                                                <Text
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                    color="gray.400"
                                                    textTransform="uppercase"
                                                    letterSpacing="0.5px"
                                                >
                                                    {card.brand}
                                                </Text>
                                                <Text fontSize="sm" fontWeight="800" color="white" noOfLines={1}>
                                                    {card.name}
                                                </Text>
                                                <Text fontSize="2xs" color="gray.300" noOfLines={1} mt={0.5}>
                                                    {card.tagline}
                                                </Text>
                                            </VStack>

                                            <Text
                                                fontSize="2xs"
                                                fontWeight="bold"
                                                color="gray.500"
                                                px={1.5}
                                                py={0.5}
                                                borderRadius="sm"
                                                border="1px solid rgba(255, 255, 255, 0.15)"
                                            >
                                                AD
                                            </Text>
                                        </Flex>
                                    </Box>

                                    {/* Product Visual Image */}
                                    <Box
                                        w="100%"
                                        h="110px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        px={4}
                                        position="relative"
                                        zIndex={1}
                                    >
                                        <Image
                                            src={card.image}
                                            alt={card.name}
                                            maxH="100%"
                                            maxW="100%"
                                            objectFit="contain"
                                            filter="drop-shadow(0 8px 16px rgba(0,0,0,0.4))"
                                            transition="transform 0.4s ease"
                                            _groupHover={{ transform: "scale(1.12)" }}
                                            fallbackSrc="/assets/boat rockers.jpg"
                                        />
                                    </Box>
                                    <Box
                                        bg="#facc15"
                                        py={1.5}
                                        px={3.5}
                                        position="relative"
                                        zIndex={2}
                                    >
                                        <Text
                                            fontSize="xs"
                                            fontWeight="900"
                                            color="gray.950"
                                            letterSpacing="0.2px"
                                        >
                                            {card.priceTag}
                                        </Text>
                                    </Box>
                                </Box>
                            ))}
                        </Flex>
                        <IconButton
                            aria-label="Next spotlight items"
                            icon={<ChevronRight size={22} />}
                            size="md"
                            borderRadius="full"
                            bg="white"
                            color="gray.900"
                            boxShadow="0 4px 14px rgba(0, 0, 0, 0.25)"
                            position="absolute"
                            right={{ base: -2, md: 2 }}
                            top="48%"
                            transform="translateY(-50%)"
                            zIndex={4}
                            _hover={{ bg: "gray.100", transform: "translateY(-50%) scale(1.1)" }}
                            transition="all 0.2s ease"
                            onClick={() => scrollSpotlight("right")}
                        />
                    </Box>
                </Box>
                <Box
                    borderRadius="2xl"
                    overflow="hidden"
                    position="relative"
                    cursor="pointer"
                    boxShadow="0 10px 30px -5px rgba(220, 38, 38, 0.3)"
                    transition="all 0.3s ease"
                    _hover={{
                        transform: "translateY(-3px)",
                        boxShadow: "0 16px 36px -4px rgba(220, 38, 38, 0.4)",
                    }}
                    onClick={() => {
                        const el = document.getElementById("all-products-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    {/* Top Garland Lights */}
                    <Box
                        bg="linear-gradient(90deg, #7f1d1d 0%, #991b1b 30%, #dc2626 70%, #7f1d1d 100%)"
                        pt={1}
                    >
                        <FestiveGarlandBorder lightCount={36} />
                    </Box>

                    {/* Festive Center Banner Body */}
                    <Box
                        bg="linear-gradient(135deg, #7f1d1d 0%, #b91c1c 25%, #dc2626 50%, #991b1b 80%, #450a0a 100%)"
                        py={{ base: 6, sm: 8, md: 10 }}
                        px={{ base: 4, sm: 6, md: 10 }}
                        position="relative"
                        overflow="hidden"
                    >
                        {/* Hanging Decorative Lanterns Background Effect */}
                        <Box
                            position="absolute"
                            top={-2}
                            left={{ base: "4%", md: "6%" }}
                            opacity={0.35}
                            fontSize={{ base: "28px", md: "42px" }}
                            pointerEvents="none"
                        >
                            🏮
                        </Box>
                        <Box
                            position="absolute"
                            top={2}
                            right={{ base: "20%", md: "26%" }}
                            opacity={0.4}
                            fontSize={{ base: "32px", md: "46px" }}
                            pointerEvents="none"
                        >
                            🏮
                        </Box>
                        <Box
                            position="absolute"
                            bottom={1}
                            right={{ base: "6%", md: "10%" }}
                            opacity={0.5}
                            fontSize={{ base: "28px", md: "44px" }}
                            pointerEvents="none"
                        >
                            🎁✨
                        </Box>

                        <Flex
                            direction={{ base: "column", sm: "row" }}
                            align="center"
                            justify="space-between"
                            gap={{ base: 4, sm: 6 }}
                            position="relative"
                            zIndex={2}
                        >
                            {/* Exploding Starburst Graphic Badge */}
                            <HStack spacing={{ base: 3, md: 6 }} align="center">
                                <Box
                                    bg="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
                                    border="3px solid #fef08a"
                                    borderRadius="2xl"
                                    p={{ base: 2.5, md: 4 }}
                                    boxShadow="0 0 25px rgba(245, 158, 11, 0.6)"
                                    transform="rotate(-4deg)"
                                    transition="transform 0.3s ease"
                                    _hover={{ transform: "rotate(0deg) scale(1.05)" }}
                                >
                                    <VStack spacing={-1} textAlign="center">
                                        <Text
                                            fontSize={{ base: "md", sm: "xl", md: "2xl" }}
                                            fontWeight="900"
                                            color="#fef08a"
                                            letterSpacing="1px"
                                            textShadow="0 2px 8px rgba(0,0,0,0.6)"
                                            lineHeight="1"
                                        >
                                            BIG
                                        </Text>
                                        <Text
                                            fontSize={{ base: "lg", sm: "2xl", md: "3xl" }}
                                            fontWeight="900"
                                            color="white"
                                            letterSpacing="1px"
                                            textShadow="0 2px 10px rgba(0,0,0,0.7)"
                                            lineHeight="1.1"
                                        >
                                            BANG
                                        </Text>
                                        <Text
                                            fontSize={{ base: "2xs", sm: "xs", md: "sm" }}
                                            fontWeight="800"
                                            color="#fef08a"
                                            letterSpacing="2px"
                                        >
                                            DIWALI
                                        </Text>
                                    </VStack>
                                </Box>

                                {/* Giant 3D Golden Headline */}
                                <VStack align="flex-start" spacing={0}>
                                    <Text
                                        fontSize={{ base: "xl", sm: "3xl", md: "5xl" }}
                                        fontWeight="900"
                                        color="#fde047"
                                        letterSpacing="-0.5px"
                                        lineHeight="1"
                                        textShadow="0 4px 14px rgba(0, 0, 0, 0.6), 0 2px 4px #b45309"
                                    >
                                        SALE STARTS
                                    </Text>
                                    <Text
                                        fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
                                        fontWeight="900"
                                        color="#fef08a"
                                        letterSpacing="1px"
                                        lineHeight="1"
                                        textShadow="0 5px 16px rgba(0, 0, 0, 0.6), 0 2px 6px #d97706"
                                    >
                                        28<Text as="span" fontSize={{ base: "lg", sm: "2xl", md: "3xl" }} verticalAlign="super">TH</Text> OCT
                                    </Text>
                                </VStack>
                            </HStack>
                        </Flex>
                    </Box>
                    <Box
                        bg="linear-gradient(90deg, #7f1d1d 0%, #991b1b 30%, #dc2626 70%, #7f1d1d 100%)"
                        pb={1}
                    >
                        <FestiveGarlandBorder lightCount={36} />
                    </Box>
                </Box>
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    overflow="hidden"
                    border="2.5px solid #db2777"
                    boxShadow="0 8px 24px -4px rgba(219, 39, 119, 0.15)"
                    transition="box-shadow 0.3s ease"
                    _hover={{
                        boxShadow: "0 12px 30px -4px rgba(219, 39, 119, 0.25)",
                    }}
                >

                    <Box
                        bg="linear-gradient(90deg, #831843 0%, #9d174d 45%, #db2777 100%)"
                        position="relative"
                        pb={2.5}
                        pt={1}
                        px={{ base: 3, sm: 4, md: 5 }}
                    >
                        <FestiveGarlandBorder lightCount={32} />

                        <Flex align="center" justify="space-between" mt={1}>
                            <HStack spacing={2.5}>
                                <Sparkles size={20} color="#fce7f3" />
                                <Text
                                    color="white"
                                    fontWeight="900"
                                    fontSize={{ base: "md", sm: "lg", md: "xl" }}
                                    letterSpacing="-0.3px"
                                    textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
                                >
                                    Popular nearby
                                </Text>
                            </HStack>

                            <IconButton
                                aria-label="View popular nearby"
                                icon={<ArrowRight size={18} strokeWidth={2.5} />}
                                size="sm"
                                borderRadius="full"
                                bg="white"
                                color="gray.900"
                                boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
                                _hover={{
                                    bg: "pink.50",
                                    transform: "translateX(2px)",
                                }}
                                transition="all 0.2s"
                                onClick={() => {
                                    const el = document.getElementById("all-products-section");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                }}
                            />
                        </Flex>
                    </Box>

                    {/*  Popular Deal Cards */}
                    <SimpleGrid
                        columns={{ base: 2, sm: 2, md: 4 }}
                        spacing={{ base: 3, md: 4 }}
                        p={{ base: 3, sm: 4, md: 5 }}
                    >
                        {popularNearbyDeals.map((item, index) => (
                            <Box
                                key={index}
                                bg={innerCardBg}
                                border="1px solid"
                                borderColor={innerCardBorder}
                                borderRadius="xl"
                                p={3}
                                cursor="pointer"
                                transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                                role="group"
                                _hover={{
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 10px 20px -3px rgba(0, 0, 0, 0.1)",
                                    borderColor: "pink.300",
                                }}
                                onClick={() => {
                                    if (item.id && !item.id.startsWith("pop-")) {
                                        navigate(`/Shopio/productDetails/${item.id}`);
                                    } else {
                                        const el = document.getElementById("all-products-section");
                                        if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }
                                }}
                            >
                                <Box
                                    w="100%"
                                    h={{ base: "130px", sm: "150px", md: "175px" }}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="white"
                                    borderRadius="lg"
                                    p={2}
                                    mb={3}
                                    overflow="hidden"
                                >
                                    {loading ? (
                                        <Skeleton w="100%" h="100%" borderRadius="lg" />
                                    ) : (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            maxW="100%"
                                            maxH="100%"
                                            objectFit="contain"
                                            transition="transform 0.35s ease"
                                            _groupHover={{ transform: "scale(1.08)" }}
                                            fallbackSrc="/assets/alexa.jpg"
                                        />
                                    )}
                                </Box>

                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color={subTextColor}
                                    noOfLines={1}
                                    mb={0.5}
                                >
                                    {item.title}
                                </Text>

                                <Text
                                    fontSize={{ base: "xs", sm: "sm" }}
                                    fontWeight="800"
                                    color={dealTextColor}
                                    noOfLines={1}
                                >
                                    {item.dealTag}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>

            </VStack>
        </Container>
    );
}
