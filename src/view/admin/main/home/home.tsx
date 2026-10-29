import {
    Box,
    Text,
    Flex,
    IconButton,
    Button,
    Image,
    HStack,
    Badge,
    Tooltip,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    Heart,
    MapPin,
    ShoppingBag,
    UserRound,
    Sparkles,
    Sun,
    Moon,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useState, useEffect } from "react";
import { authRepository, User } from "../../../../api/authRepository";
import AddressModal from "../address/address";
import ProfileModal from "../../userprofile/userprofile";
import Footer from "../../footer/footer";
import { productRepository, ProductsTableData } from "../../../../api/product";
import { cartApi } from "../../../../api/cart";
import { getLocalCartCount } from "../../../../utils/cartStorage";
import { getLocalFavouriteCount } from "../../../../utils/favouriteStorage";
import ProductSearch from "../../../../component/debounce/debounce";

export default function Home() {
    const { token, user, userId } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { colorMode, toggleColorMode } = useColorMode();
    const pageBg = useColorModeValue("#f8fafc", "#0b1120");

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [modalInitialTab, setModalInitialTab] = useState<"address" | "login">("address");
    const [users, setUsers] = useState<User | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [products, setProducts] = useState<ProductsTableData[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState<number>(0);
    const [favCount, setFavCount] = useState<number>(0);

    // Sync logged-in or guest address in real time
    useEffect(() => {
        const syncAddress = async () => {
            if (userId) {
                try {
                    const res = await authRepository.getUserById(userId);
                    if (res && res.success && res.data) {
                        setUsers(res.data);
                    }
                } catch (e) {
                    console.error("Failed to sync user address", e);
                }
            } else {
                try {
                    const guestSaved = localStorage.getItem("guestAddress");
                    if (guestSaved) {
                        setUsers({ address: JSON.parse(guestSaved) } as User);
                    } else {
                        setUsers(null);
                    }
                } catch (e) {
                    setUsers(null);
                }
            }
        };

        syncAddress();
    }, [userId, token]);

    // Sync favourite count
    useEffect(() => {
        const updateFavCount = async () => {
            if (token) {
                try {
                    const res = await productRepository.getFavouriteProducts(userId || undefined);
                    if (res && res.data && Array.isArray(res.data)) {
                        setFavCount(res.data.length);
                    } else {
                        setFavCount(0);
                    }
                } catch {
                    setFavCount(0);
                }
            } else {
                setFavCount(getLocalFavouriteCount());
            }
        };

        updateFavCount();
        window.addEventListener("storage", updateFavCount);
        window.addEventListener("favourite-updated", updateFavCount);
        return () => {
            window.removeEventListener("storage", updateFavCount);
            window.removeEventListener("favourite-updated", updateFavCount);
        };
    }, [location.pathname, token, userId]);

    // Sync cart count from database (when logged in) or localStorage (guest)
    useEffect(() => {
        const updateCart = async () => {
            if (token) {
                try {
                    const count = await cartApi.getCartCount();
                    setCartCount(typeof count === "number" ? count : 0);
                } catch {
                    setCartCount(0);
                }
            } else {
                setCartCount(getLocalCartCount());
            }
        };

        updateCart();
        window.addEventListener("storage", updateCart);
        window.addEventListener("cart-updated", updateCart);
        return () => {
            window.removeEventListener("storage", updateCart);
            window.removeEventListener("cart-updated", updateCart);
        };
    }, [location.pathname, token]);

    const activeAddress = users?.address || user?.address;
    const hasAddress =
        !!activeAddress &&
        !!activeAddress.street &&
        !!activeAddress.city &&
        !!activeAddress.state &&
        !!activeAddress.country;

    const currentCategory = location.pathname.includes("/category/")
        ? decodeURIComponent(location.pathname.split("/category/")[1] || "")
        : selectedCategory;

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        navigate(`/Shopio/category/${encodeURIComponent(category)}`);
    };

    const handleClearCategory = () => {
        setSelectedCategory("");
        setProducts([]);
        navigate("/Shopio");
    };


    return (
        <Flex direction="column" w="100%" minH="100vh" bg={pageBg} transition="background-color 0.2s ease">
            {/* Top Bar / Header */}
            <Box
                as="header"
                position="sticky"
                top={0}
                zIndex={100}
                bg="linear-gradient(135deg, #e53e3e 0%, #c53030 50%, #9b2c2c 100%)"
                boxShadow="0 4px 20px -2px rgba(229, 62, 62, 0.25)"
                transition="all 0.3s ease"
            >
                {/* Main Navigation Bar */}
                <Flex
                    maxW="1480px"
                    mx="auto"
                    px={{ base: 3, sm: 4, md: 6, lg: 8 }}
                    py={{ base: 2.5, md: 3 }}
                    align="center"
                    justify="space-between"
                    gap={{ base: 2, md: 4 }}
                    wrap={{ base: "wrap", md: "nowrap" }}
                >
                    {/* Left Section: Menu Toggle + Logo + Location Pill */}
                    <HStack spacing={{ base: 2, sm: 3, md: 4 }} flexShrink={0}>

                        {/* Logo */}
                        <Box
                            cursor="pointer"
                            onClick={() => navigate("/Shopio")}
                            transition="transform 0.2s"
                            _hover={{ transform: "scale(1.03)" }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Image
                                src="/assets/Glossy Red Shopio Shopping Cart Logo.png"
                                alt="Shopio Logo"
                                width={{ base: "150px", sm: "180px", md: "180px", lg: "210px" }}
                                height={{ base: "42px", md: "80px" }}
                                objectFit="contain"
                            />
                        </Box>

                        {/* Address Pill */}
                        <Flex
                            align="center"
                            cursor="pointer"
                            onClick={() => {
                                setModalInitialTab("address");
                                setShowAddressForm(true);
                            }}
                            bg="whiteAlpha.150"
                            backdropFilter="blur(8px)"
                            border="1px solid"
                            borderColor="whiteAlpha.300"
                            px={{ base: 2, sm: 3 }}
                            py={1.5}
                            borderRadius="full"
                            transition="all 0.2s ease"
                            _hover={{
                                bg: "whiteAlpha.300",
                                borderColor: "whiteAlpha.500",
                                transform: "translateY(-1px)",
                            }}
                            maxW={{ base: "115px", sm: "160px", md: "210px" }}
                        >
                            <Box
                                p={1}
                                bg="whiteAlpha.200"
                                borderRadius="full"
                                mr={2}
                                color="white"
                                flexShrink={0}
                            >
                                <MapPin size={16} />
                            </Box>

                            {hasAddress ? (
                                <Box overflow="hidden" lineHeight="short">
                                    <Text
                                        color="whiteAlpha.700"
                                        fontSize="2xs"
                                        fontWeight="semibold"
                                        textTransform="uppercase"
                                        letterSpacing="0.5px"
                                    >
                                        Deliver to
                                    </Text>
                                    <Text
                                        color="white"
                                        fontWeight="bold"
                                        fontSize={{ base: "xs", sm: "xs" }}
                                        noOfLines={1}
                                    >
                                        {activeAddress?.street}
                                    </Text>
                                    <Text
                                        color="whiteAlpha.800"
                                        fontSize="2xs"
                                        noOfLines={1}
                                    >
                                        {activeAddress?.city}, {activeAddress?.state}
                                    </Text>
                                </Box>
                            ) : (
                                <Box overflow="hidden" lineHeight="short">
                                    <Text
                                        color="whiteAlpha.800"
                                        fontSize="2xs"
                                        fontWeight="semibold"
                                    >
                                        Deliver to
                                    </Text>
                                    <Text
                                        color="white"
                                        fontSize={{ base: "xs", sm: "sm" }}
                                        fontWeight="bold"
                                        noOfLines={1}
                                    >
                                        Add Address
                                    </Text>
                                </Box>
                            )}
                        </Flex>
                    </HStack>

                    {/* Middle Section: Search Bar */}
                    <ProductSearch />
                    {/* Right Section: Action Buttons */}
                    <HStack
                        spacing={{ base: 1, sm: 2, md: 3 }}
                        flexShrink={0}
                        order={{ base: 2, md: 3 }}
                    >
                        {/* Wishlist Icon Button */}
                        <Tooltip label="Saved Wishlist" hasArrow placement="bottom">
                            <Box position="relative" display="inline-block">
                                <IconButton
                                    aria-label="Wishlist"
                                    icon={<Heart size={18} />}
                                    variant="ghost"
                                    color="white"
                                    size={{ base: "sm", md: "md" }}
                                    borderRadius="full"
                                    _hover={{ bg: "whiteAlpha.200", transform: "scale(1.05)" }}
                                    _active={{ bg: "whiteAlpha.300" }}
                                    onClick={() => navigate("/Shopio/favourite")}
                                />
                                {favCount > 0 && (
                                    <Badge
                                        position="absolute"
                                        top="-2px"
                                        right="-2px"
                                        bg="white"
                                        color="red.600"
                                        fontSize="2xs"
                                        fontWeight="black"
                                        borderRadius="full"
                                        px={1.5}
                                        boxShadow="sm"
                                    >
                                        {favCount}
                                    </Badge>
                                )}
                            </Box>
                        </Tooltip>

                        {/* Cart / Shopping Bag Button */}
                        <Tooltip label="Shopping Cart" hasArrow placement="bottom">
                            <Box position="relative" display="inline-block">
                                <IconButton
                                    aria-label="Shopping Cart"
                                    icon={<ShoppingBag size={18} />}
                                    variant="ghost"
                                    color="white"
                                    size={{ base: "sm", md: "md" }}
                                    borderRadius="full"
                                    _hover={{ bg: "whiteAlpha.200", transform: "scale(1.05)" }}
                                    _active={{ bg: "whiteAlpha.300" }}
                                    onClick={() => navigate("/Shopio/cart")}
                                />
                                {cartCount > 0 && (
                                    <Badge
                                        position="absolute"
                                        top="-2px"
                                        right="-2px"
                                        bg="white"
                                        color="red.600"
                                        fontSize="2xs"
                                        fontWeight="black"
                                        borderRadius="full"
                                        px={1.5}
                                        boxShadow="sm"
                                    >
                                        {cartCount}
                                    </Badge>
                                )}
                            </Box>
                        </Tooltip>

                        {/* Profile Button */}
                        <Tooltip
                            label={token ? "My Account" : "Login"}
                            hasArrow
                            placement="bottom"
                        >
                            <Button
                                leftIcon={<UserRound size={17} />}
                                onClick={() => {
                                    if (token) {
                                        setIsProfileOpen(true);
                                    } else {
                                        navigate("/Shopio/login");
                                    }
                                }}
                                variant="ghost"
                                color="white"
                                borderRadius="full"
                                size={{ base: "sm", md: "md" }}
                                px={{ base: 2, sm: 3 }}
                                fontSize="sm"
                                fontWeight="semibold"
                                _hover={{ bg: "whiteAlpha.200", transform: "translateY(-1px)" }}
                                _active={{ bg: "whiteAlpha.300" }}
                            >
                                <Text display={{ base: "none", lg: "inline" }}>
                                    {token ? "Account" : "Login"}
                                </Text>
                            </Button>
                        </Tooltip>

                        {/* Theme Toggle Button (Dark / Light) */}
                        <Tooltip
                            label={colorMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            hasArrow
                            placement="bottom"
                        >
                            <IconButton
                                aria-label="Toggle Color Mode"
                                icon={
                                    colorMode === "dark" ? (
                                        <Sun size={18} color="#fbbf24" />
                                    ) : (
                                        <Moon size={18} color="#ffffff" />
                                    )
                                }
                                variant="ghost"
                                color="white"
                                size={{ base: "sm", md: "md" }}
                                borderRadius="full"
                                _hover={{ bg: "whiteAlpha.250", transform: "scale(1.08)" }}
                                _active={{ bg: "whiteAlpha.350" }}
                                transition="all 0.2s ease"
                                onClick={toggleColorMode}
                            />
                        </Tooltip>
                    </HStack>
                </Flex>

                {/* Secondary Category Ribbon */}
                <Box
                    bg="rgba(0, 0, 0, 0.12)"
                    backdropFilter="blur(6px)"
                    borderTop="1px solid"
                    borderColor="whiteAlpha.200"
                    overflowX="auto"
                    sx={{
                        "&::-webkit-scrollbar": { display: "none" },
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                    }}
                >
                    <Flex
                        maxW="1480px"
                        mx="auto"
                        px={{ base: 4, md: 8 }}
                        py={2}
                        align="center"
                        gap={{ base: 2, sm: 3, md: 6 }}
                        fontSize="xs"
                        fontWeight="semibold"
                        color="white"
                        whiteSpace="nowrap"
                    >
                        <HStack
                            cursor="pointer"
                            onClick={handleClearCategory}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg={!currentCategory ? "whiteAlpha.300" : "transparent"}
                            _hover={{ bg: "whiteAlpha.200" }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            <Sparkles size={14} />
                            <Text>All Categories</Text>
                        </HStack>

                        <Text
                            cursor="pointer"
                            onClick={() => handleCategoryClick("Electronic")}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg={currentCategory?.toLowerCase().includes("elect") ? "whiteAlpha.300" : "transparent"}
                            _hover={{ bg: "whiteAlpha.200" }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            Electronics
                        </Text>

                        <Text
                            cursor="pointer"
                            onClick={() => handleCategoryClick("Mobile")}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg={currentCategory?.toLowerCase().includes("mobile") ? "whiteAlpha.300" : "transparent"}
                            _hover={{ bg: "whiteAlpha.200" }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            Mobile
                        </Text>

                        <Text
                            cursor="pointer"
                            onClick={() => handleCategoryClick("Accessories")}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg={currentCategory?.toLowerCase().includes("Accessories") ? "whiteAlpha.300" : "transparent"}
                            _hover={{ bg: "whiteAlpha.200" }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            Accessories
                        </Text>

                        <Text
                            cursor="pointer"
                            onClick={() => handleCategoryClick("watches")}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg={currentCategory?.toLowerCase().includes("watch") ? "whiteAlpha.300" : "transparent"}
                            _hover={{ bg: "whiteAlpha.200" }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            Watches
                        </Text>

                        <Text
                            cursor="pointer"
                            onClick={() => handleCategoryClick("shoes")}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg={currentCategory?.toLowerCase().includes("shoe") ? "whiteAlpha.300" : "transparent"}
                            _hover={{ bg: "whiteAlpha.200" }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            Shoes
                        </Text>

                        <Text
                            cursor="pointer"
                            onClick={() => handleCategoryClick("Beauty")}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg={currentCategory?.toLowerCase().includes("beauty") ? "whiteAlpha.300" : "transparent"}
                            _hover={{ bg: "whiteAlpha.200" }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            Beauty & Care
                        </Text>

                        <Text
                            cursor="pointer"
                            onClick={() => handleCategoryClick("Fashion")}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg={currentCategory?.toLowerCase().includes("fash") ? "whiteAlpha.300" : "transparent"}
                            _hover={{ bg: "whiteAlpha.200" }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            Fashion
                        </Text>

                        <Text
                            cursor="pointer"
                            onClick={() => handleCategoryClick("Home & furniture")}
                            px={2.5}
                            py={1}
                            borderRadius="md"
                            bg={currentCategory?.toLowerCase().includes("home & furniture") ? "whiteAlpha.300" : "transparent"}
                            _hover={{ bg: "whiteAlpha.200" }}
                            transition="all 0.2s"
                            flexShrink={0}
                        >
                            Home & Furniture
                        </Text>

                        <Badge
                            bg="yellow.400"
                            color="gray.900"
                            fontSize="2xs"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            cursor="pointer"
                            ml={{ base: 2, md: "auto" }}
                            flexShrink={0}
                            _hover={{ bg: "yellow.300" }}
                            onClick={() => {
                                if (location.pathname !== "/" && location.pathname.toLowerCase() !== "/Shopio") {
                                    navigate("/Shopio");
                                }
                                setTimeout(() => {
                                    const el = document.getElementById("all-products-section");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                }, 100);
                            }}
                        >
                            ⚡ TODAY'S DEALS
                        </Badge>
                    </Flex>
                </Box>
            </Box>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />

            {/* Address & Real-time Auth Modal */}
            <AddressModal
                isOpen={showAddressForm}
                onClose={() => setShowAddressForm(false)}
                initialTab={modalInitialTab}
                onSave={(updatedUser) => {
                    setUsers(updatedUser);
                    setShowAddressForm(false);
                }}
                user={user}
            />

            {/* Main Content Area: Renders Child Pages within Home Layout */}
            <Box as="main" flex="1" pb={12}>
                <Outlet
                    context={{
                        selectedCategory,
                        products,
                        loading,
                        handleCategoryClick,
                        handleClearCategory,
                    }}
                />
            </Box>

            {/* Footer */}
            <Footer />
        </Flex>
    );
}
