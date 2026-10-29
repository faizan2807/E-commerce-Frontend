import React, { useEffect, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Grid,
    Input,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Box,
    Text,
    Badge,
    Flex,
    InputGroup,
    InputRightElement,
    IconButton,
    Spinner,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    MapPin,
    User as UserIcon,
    Eye,
    EyeOff,
    LogIn,
    LogOut,
    CheckCircle2,
} from "lucide-react";
import { authRepository, User } from "../../../../api/authRepository";
import { useAuth } from "../../../../context/AuthContext";
import { useCenterAlert } from "../../../../context/AlertContext";

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    onSave?: (user: User) => void;
    initialTab?: "address" | "login";
}

export default function AddressModal({
    isOpen,
    onClose,
    onSave,
    initialTab = "address",
}: AddressModalProps) {
    const { userId, email, token, signIn, signUp, logout } = useAuth();
    const { showAlert } = useCenterAlert();

    const modalBg = useColorModeValue("white", "gray.800");
    const modalBorder = useColorModeValue("gray.100", "gray.700");
    const titleColor = useColorModeValue("gray.800", "white");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const toggleBg = useColorModeValue("gray.100", "gray.900");
    const toggleInactiveColor = useColorModeValue("gray.600", "gray.400");
    const labelColor = useColorModeValue("gray.700", "gray.300");
    const inputBorder = useColorModeValue("gray.200", "gray.600");
    const inputBg = useColorModeValue("white", "gray.900");
    const footerBg = useColorModeValue("gray.50", "gray.900");
    const footerBorder = useColorModeValue("gray.100", "gray.700");
    const bannerGuestBg = useColorModeValue("orange.50", "rgba(251, 146, 60, 0.12)");
    const bannerGuestBorder = useColorModeValue("orange.200", "orange.700");
    const bannerGuestText = useColorModeValue("orange.800", "orange.200");
    const bannerGuestSubText = useColorModeValue("orange.700", "orange.300");
    const bannerAuthBg = useColorModeValue("green.50", "rgba(34, 197, 94, 0.12)");
    const bannerAuthBorder = useColorModeValue("green.200", "green.700");
    const bannerAuthText = useColorModeValue("green.800", "green.200");
    const profileCardBg = useColorModeValue("gray.50", "gray.700");
    const profileCardBorder = useColorModeValue("gray.200", "gray.600");

    // Active tab in real-time toggle: "address" or "auth"
    const [activeTab, setActiveTab] = useState<"address" | "auth">("address");
    // Auth sub-view: "signin" or "signup"
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

    // Address form state
    const [fullUser, setFullUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<User>({
        address: {
            street: "",
            city: "",
            state: "",
            country: "",
            zipCode: 0,
        },
    } as User);

    // Auth form state
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [signupData, setSignupData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    // Loaders
    const [fetchingAddress, setFetchingAddress] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    // Initialize or reset view on open
    useEffect(() => {
        if (!isOpen) return;

        if (initialTab === "login" && !token) {
            setActiveTab("auth");
        } else {
            setActiveTab("address");
        }
    }, [isOpen, initialTab, token]);

    // Fetch logged-in user's address when user / token changes
    useEffect(() => {
        if (!isOpen) return;

        if (!userId) {
            // Check if guest has temporary address saved in localStorage
            try {
                const guestSaved = localStorage.getItem("guestAddress");
                if (guestSaved) {
                    const parsed = JSON.parse(guestSaved);
                    setFormData((prev) => ({
                        ...prev,
                        address: parsed,
                    }));
                }
            } catch (e) {
                console.error("Failed to parse guest address", e);
            }
            return;
        }

        const fetchAddress = async () => {
            try {
                setFetchingAddress(true);
                const response = await authRepository.getUserById(userId);
                if (response && response.success && response.data) {
                    const userData = response.data;
                    setFullUser(userData);
                    setFormData({
                        ...userData,
                        address: {
                            street: userData.address?.street ?? "",
                            city: userData.address?.city ?? "",
                            state: userData.address?.state ?? "",
                            country: userData.address?.country ?? "",
                            zipCode: userData.address?.zipCode ?? 0,
                        },
                    });
                }
            } catch (error) {
                console.error("Error fetching user address:", error);
            } finally {
                setFetchingAddress(false);
            }
        };

        fetchAddress();
    }, [isOpen, userId]);

    // Handle address field change
    const handleAddressChange = (
        field: keyof User["address"],
        value: string | number
    ) => {
        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value,
            },
        }));
    };

    // Save Address
    const handleSaveAddress = async () => {
        if (!formData.address?.street || !formData.address?.city) {
            showAlert({
                title: "Incomplete Address",
                description: "Please provide at least a street address and city.",
                status: "warning",
            });
            return;
        }

        try {
            setSavingAddress(true);

            if (userId) {
                // Save to backend database
                const payload: User = {
                    ...(fullUser || formData),
                    address: formData.address,
                };
                const updated = await authRepository.updateuser(userId, payload);
                setFormData(updated);
                onSave?.(updated);
            } else {
                // Save to local guest store
                localStorage.setItem("guestAddress", JSON.stringify(formData.address));
                onSave?.(formData);
            }

            showAlert({
                title: "Address Saved!",
                description: "Your delivery address has been updated successfully.",
                status: "success",
                duration: 2500,
            });

            onClose();
        } catch (error: any) {
            console.error("Failed to save address:", error);
            showAlert({
                title: "Failed to Save Address",
                description:
                    error.response?.data?.message ||
                    error.message ||
                    "Could not persist address changes.",
                status: "error",
            });
        } finally {
            setSavingAddress(false);
        }
    };

    // Real-Time Sign In Handler
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginData.email || !loginData.password) {
            showAlert({
                title: "Missing Credentials",
                description: "Please enter your email and password.",
                status: "warning",
            });
            return;
        }

        try {
            setAuthLoading(true);
            await signIn(loginData);

            showAlert({
                title: "Welcome Back!",
                description: "Logged in successfully. Now configuring your address.",
                status: "success",
                duration: 2500,
            });

            // Real-time switch straight to Address tab!
            setActiveTab("address");
            setLoginData({ email: "", password: "" });
        } catch (error: any) {
            showAlert({
                title: "Sign In Failed",
                description:
                    error.response?.data?.message || "Invalid email or password.",
                status: "error",
            });
        } finally {
            setAuthLoading(false);
        }
    };

    // Real-Time Sign Up Handler
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !signupData.firstName ||
            !signupData.email ||
            !signupData.contact ||
            !signupData.password
        ) {
            showAlert({
                title: "Missing Information",
                description: "Please complete all required fields.",
                status: "warning",
            });
            return;
        }

        try {
            setAuthLoading(true);
            await signUp({
                firstName: signupData.firstName.trim(),
                lastName: signupData.lastName.trim(),
                email: signupData.email.trim(),
                contact: Number(signupData.contact),
                password: signupData.password,
                role: "user",
            });

            showAlert({
                title: "Account Created!",
                description: "Welcome to Shopio! Now set your delivery address.",
                status: "success",
                duration: 2500,
            });

            // Real-time switch directly to Address tab!
            setActiveTab("address");
            setSignupData({
                firstName: "",
                lastName: "",
                email: "",
                contact: "",
                password: "",
            });
        } catch (error: any) {
            showAlert({
                title: "Registration Failed",
                description:
                    error.response?.data?.message || "Could not complete signup.",
                status: "error",
            });
        } finally {
            setAuthLoading(false);
        }
    };

    // Real-Time Logout Handler
    const handleLogout = () => {
        logout();
        showAlert({
            title: "Signed Out",
            description: "You have signed out of your account.",
            status: "info",
            duration: 2000,
        });
        setAuthMode("signin");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />

            <ModalContent
                bg={modalBg}
                borderRadius="2xl"
                boxShadow="2xl"
                overflow="hidden"
                border="1px solid"
                borderColor={modalBorder}
                mx={{ base: 3, md: 0 }}
                maxH={{ base: "90vh", md: "88vh" }}
                overflowY="auto"
            >
                {/* Header with Real-Time Toggle Pills */}
                <ModalHeader pt={6} pb={2} px={6}>
                    <Flex justify="space-between" align="center" mb={4}>
                        <Box>
                            <Text fontSize="lg" fontWeight="800" color={titleColor} letterSpacing="-0.5px">
                                {activeTab === "address" ? "Delivery Destination" : "Account Access"}
                            </Text>
                            <Text fontSize="xs" color={subTextColor} mt={0.5}>
                                Real-time address & account management
                            </Text>
                        </Box>
                        <ModalCloseButton position="static" borderRadius="full" />
                    </Flex>

                    {/* Segmented Real-Time Toggle Switch */}
                    <Flex
                        bg={toggleBg}
                        p={1}
                        borderRadius="xl"
                        w="100%"
                        justify="space-between"
                        gap={1}
                    >
                        <Button
                            flex="1"
                            size="sm"
                            borderRadius="lg"
                            leftIcon={<MapPin size={15} />}
                            bg={activeTab === "address" ? "red.500" : "transparent"}
                            color={activeTab === "address" ? "white" : toggleInactiveColor}
                            boxShadow={activeTab === "address" ? "sm" : "none"}
                            _hover={{
                                bg: activeTab === "address" ? "red.600" : toggleBg,
                            }}
                            onClick={() => setActiveTab("address")}
                            fontSize="xs"
                            fontWeight="bold"
                            transition="all 0.2s ease"
                        >
                            Delivery Address
                        </Button>

                        <Button
                            flex="1"
                            size="sm"
                            borderRadius="lg"
                            leftIcon={token ? <UserIcon size={15} /> : <LogIn size={15} />}
                            bg={activeTab === "auth" ? "red.500" : "transparent"}
                            color={activeTab === "auth" ? "white" : toggleInactiveColor}
                            boxShadow={activeTab === "auth" ? "sm" : "none"}
                            _hover={{
                                bg: activeTab === "auth" ? "red.600" : toggleBg,
                            }}
                            onClick={() => setActiveTab("auth")}
                            fontSize="xs"
                            fontWeight="bold"
                            transition="all 0.2s ease"
                        >
                            {token ? "My Account" : "Sign In / Register"}
                        </Button>
                    </Flex>
                </ModalHeader>

                <ModalBody px={6} py={4}>
                    {/* TAB 1: DELIVERY ADDRESS */}
                    {activeTab === "address" && (
                        <Box>
                            {/* Auth banner indicator */}
                            {!userId ? (
                                <Flex
                                    bg={bannerGuestBg}
                                    border="1px solid"
                                    borderColor={bannerGuestBorder}
                                    borderRadius="xl"
                                    p={3}
                                    mb={4}
                                    align="center"
                                    justify="space-between"
                                >
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" color={bannerGuestText}>
                                            Browsing in Guest Mode
                                        </Text>
                                        <Text fontSize="2xs" color={bannerGuestSubText}>
                                            Sign in to save this address to your account permanently.
                                        </Text>
                                    </Box>
                                    <Button
                                        size="xs"
                                        colorScheme="orange"
                                        borderRadius="md"
                                        onClick={() => {
                                            setActiveTab("auth");
                                            setAuthMode("signin");
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                </Flex>
                            ) : (
                                <Flex
                                    bg={bannerAuthBg}
                                    border="1px solid"
                                    borderColor={bannerAuthBorder}
                                    borderRadius="xl"
                                    px={3}
                                    py={2}
                                    mb={4}
                                    align="center"
                                    gap={2}
                                >
                                    <CheckCircle2 size={15} color="#16a34a" />
                                    <Text fontSize="xs" color={bannerAuthText} fontWeight="medium">
                                        Syncing address for: <strong>{email}</strong>
                                    </Text>
                                </Flex>
                            )}

                            {fetchingAddress ? (
                                <VStack py={8} spacing={3}>
                                    <Spinner color="red.500" size="lg" />
                                    <Text fontSize="sm" color={subTextColor}>
                                        Loading your address details...
                                    </Text>
                                </VStack>
                            ) : (
                                <VStack spacing={3.5} align="stretch">
                                    {/* Street */}
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                            Street Address
                                        </FormLabel>
                                        <Input
                                            borderRadius="xl"
                                            fontSize="sm"
                                            bg={inputBg}
                                            borderColor={inputBorder}
                                            _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                            placeholder="e.g. 104 Greenfield Avenue, Apt 4B"
                                            value={formData.address?.street ?? ""}
                                            onChange={(e) => handleAddressChange("street", e.target.value)}
                                        />
                                    </FormControl>

                                    {/* City & State Grid */}
                                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3}>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                City
                                            </FormLabel>
                                            <Input
                                                borderRadius="xl"
                                                fontSize="sm"
                                                bg={inputBg}
                                                borderColor={inputBorder}
                                                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                                placeholder="e.g. Mumbai"
                                                value={formData.address?.city ?? ""}
                                                onChange={(e) => handleAddressChange("city", e.target.value)}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                State / Province
                                            </FormLabel>
                                            <Input
                                                borderRadius="xl"
                                                fontSize="sm"
                                                bg={inputBg}
                                                borderColor={inputBorder}
                                                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                                placeholder="e.g. Maharashtra"
                                                value={formData.address?.state ?? ""}
                                                onChange={(e) => handleAddressChange("state", e.target.value)}
                                            />
                                        </FormControl>
                                    </Grid>

                                    {/* Country & Zip Code Grid */}
                                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3}>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                Country
                                            </FormLabel>
                                            <Input
                                                borderRadius="xl"
                                                fontSize="sm"
                                                bg={inputBg}
                                                borderColor={inputBorder}
                                                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                                placeholder="e.g. India"
                                                value={formData.address?.country ?? ""}
                                                onChange={(e) => handleAddressChange("country", e.target.value)}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                Postal / Zip Code
                                            </FormLabel>
                                            <Input
                                                type="number"
                                                borderRadius="xl"
                                                fontSize="sm"
                                                bg={inputBg}
                                                borderColor={inputBorder}
                                                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                                placeholder="e.g. 400001"
                                                value={formData.address?.zipCode ? String(formData.address.zipCode) : ""}
                                                onChange={(e) =>
                                                    handleAddressChange(
                                                        "zipCode",
                                                        Number(e.target.value) || 0
                                                    )
                                                }
                                            />
                                        </FormControl>
                                    </Grid>
                                </VStack>
                            )}
                        </Box>
                    )}

                    {/* TAB 2: AUTH / ACCOUNT */}
                    {activeTab === "auth" && (
                        <Box>
                            {token ? (
                                /* Logged In Profile Card */
                                <VStack spacing={4} align="stretch" py={2}>
                                    <Flex
                                        p={4}
                                        bg={profileCardBg}
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor={profileCardBorder}
                                        align="center"
                                        gap={4}
                                    >
                                        <Flex
                                            w="48px"
                                            h="48px"
                                            borderRadius="full"
                                            bg="red.500"
                                            color="white"
                                            align="center"
                                            justify="center"
                                            fontSize="lg"
                                            fontWeight="bold"
                                        >
                                            {email ? email.charAt(0).toUpperCase() : "U"}
                                        </Flex>
                                        <Box flex="1" overflow="hidden">
                                            <HStack spacing={2}>
                                                <Text fontWeight="bold" fontSize="sm" color={titleColor} noOfLines={1}>
                                                    {fullUser?.firstName
                                                        ? `${fullUser.firstName} ${fullUser.lastName || ""}`
                                                        : "Shopio Member"}
                                                </Text>
                                                <Badge colorScheme="red" fontSize="2xs" borderRadius="md">
                                                    Active
                                                </Badge>
                                            </HStack>
                                            <Text fontSize="xs" color={subTextColor} noOfLines={1}>
                                                {email}
                                            </Text>
                                        </Box>
                                    </Flex>

                                    <Button
                                        leftIcon={<MapPin size={16} />}
                                        colorScheme="red"
                                        variant="outline"
                                        borderRadius="xl"
                                        size="md"
                                        w="100%"
                                        onClick={() => setActiveTab("address")}
                                    >
                                        Manage Delivery Address
                                    </Button>

                                    <Button
                                        leftIcon={<LogOut size={16} />}
                                        colorScheme="gray"
                                        variant="ghost"
                                        borderRadius="xl"
                                        size="md"
                                        w="100%"
                                        color="red.600"
                                        onClick={handleLogout}
                                    >
                                        Sign Out of Account
                                    </Button>
                                </VStack>
                            ) : (
                                /* Unauthenticated: Real-time Sign In / Sign Up Forms */
                                <Box>
                                    {/* Sub-toggle link */}
                                    <Flex justify="center" mb={4} gap={2}>
                                        <Button
                                            size="xs"
                                            variant={authMode === "signin" ? "solid" : "ghost"}
                                            colorScheme={authMode === "signin" ? "red" : "gray"}
                                            borderRadius="full"
                                            px={4}
                                            onClick={() => setAuthMode("signin")}
                                        >
                                            Sign In
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant={authMode === "signup" ? "solid" : "ghost"}
                                            colorScheme={authMode === "signup" ? "red" : "gray"}
                                            borderRadius="full"
                                            px={4}
                                            onClick={() => setAuthMode("signup")}
                                        >
                                            Create Account
                                        </Button>
                                    </Flex>

                                    {authMode === "signin" ? (
                                        /* In-Modal Sign In Form */
                                        <form onSubmit={handleSignIn}>
                                            <VStack spacing={3.5} align="stretch">
                                                <FormControl isRequired>
                                                    <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                        Email Address
                                                    </FormLabel>
                                                    <InputGroup>
                                                        <Input
                                                            type="email"
                                                            borderRadius="xl"
                                                            fontSize="sm"
                                                            bg={inputBg}
                                                            borderColor={inputBorder}
                                                            placeholder="your.email@example.com"
                                                            value={loginData.email}
                                                            onChange={(e) =>
                                                                setLoginData((prev) => ({
                                                                    ...prev,
                                                                    email: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </InputGroup>
                                                </FormControl>

                                                <FormControl isRequired>
                                                    <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                        Password
                                                    </FormLabel>
                                                    <InputGroup>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            borderRadius="xl"
                                                            fontSize="sm"
                                                            bg={inputBg}
                                                            borderColor={inputBorder}
                                                            placeholder="Enter your password"
                                                            value={loginData.password}
                                                            onChange={(e) =>
                                                                setLoginData((prev) => ({
                                                                    ...prev,
                                                                    password: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                        <InputRightElement>
                                                            <IconButton
                                                                aria-label="Toggle password"
                                                                size="sm"
                                                                variant="ghost"
                                                                icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                onClick={() => setShowPassword(!showPassword)}
                                                            />
                                                        </InputRightElement>
                                                    </InputGroup>
                                                </FormControl>

                                                <Button
                                                    type="submit"
                                                    colorScheme="red"
                                                    size="md"
                                                    borderRadius="xl"
                                                    mt={2}
                                                    isLoading={authLoading}
                                                    w="100%"
                                                >
                                                    Sign In & Continue
                                                </Button>

                                                <Text textAlign="center" fontSize="xs" color={subTextColor} pt={1}>
                                                    Don't have an account?{" "}
                                                    <Text
                                                        as="span"
                                                        color="red.600"
                                                        fontWeight="bold"
                                                        cursor="pointer"
                                                        onClick={() => setAuthMode("signup")}
                                                    >
                                                        Sign Up
                                                    </Text>
                                                </Text>
                                            </VStack>
                                        </form>
                                    ) : (
                                        /* In-Modal Sign Up Form */
                                        <form onSubmit={handleSignUp}>
                                            <VStack spacing={3} align="stretch">
                                                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                                                    <FormControl isRequired>
                                                        <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                            First Name
                                                        </FormLabel>
                                                        <Input
                                                            borderRadius="xl"
                                                            fontSize="sm"
                                                            bg={inputBg}
                                                            borderColor={inputBorder}
                                                            placeholder="John"
                                                            value={signupData.firstName}
                                                            onChange={(e) =>
                                                                setSignupData((prev) => ({
                                                                    ...prev,
                                                                    firstName: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                            Last Name
                                                        </FormLabel>
                                                        <Input
                                                            borderRadius="xl"
                                                            fontSize="sm"
                                                            bg={inputBg}
                                                            borderColor={inputBorder}
                                                            placeholder="Doe"
                                                            value={signupData.lastName}
                                                            onChange={(e) =>
                                                                setSignupData((prev) => ({
                                                                    ...prev,
                                                                    lastName: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </FormControl>
                                                </Grid>

                                                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                                                    <FormControl isRequired>
                                                        <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                            Email
                                                        </FormLabel>
                                                        <Input
                                                            type="email"
                                                            borderRadius="xl"
                                                            fontSize="sm"
                                                            bg={inputBg}
                                                            borderColor={inputBorder}
                                                            placeholder="john@example.com"
                                                            value={signupData.email}
                                                            onChange={(e) =>
                                                                setSignupData((prev) => ({
                                                                    ...prev,
                                                                    email: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </FormControl>

                                                    <FormControl isRequired>
                                                        <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                            Phone
                                                        </FormLabel>
                                                        <Input
                                                            type="number"
                                                            borderRadius="xl"
                                                            fontSize="sm"
                                                            bg={inputBg}
                                                            borderColor={inputBorder}
                                                            placeholder="9876543210"
                                                            value={signupData.contact}
                                                            onChange={(e) =>
                                                                setSignupData((prev) => ({
                                                                    ...prev,
                                                                    contact: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </FormControl>
                                                </Grid>

                                                <FormControl isRequired>
                                                    <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                                                        Password
                                                    </FormLabel>
                                                    <InputGroup>
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            borderRadius="xl"
                                                            fontSize="sm"
                                                            bg={inputBg}
                                                            borderColor={inputBorder}
                                                            placeholder="Minimum 6 characters"
                                                            value={signupData.password}
                                                            onChange={(e) =>
                                                                setSignupData((prev) => ({
                                                                    ...prev,
                                                                    password: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                        <InputRightElement>
                                                            <IconButton
                                                                aria-label="Toggle password"
                                                                size="sm"
                                                                variant="ghost"
                                                                icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                onClick={() => setShowPassword(!showPassword)}
                                                            />
                                                        </InputRightElement>
                                                    </InputGroup>
                                                </FormControl>

                                                <Button
                                                    type="submit"
                                                    colorScheme="red"
                                                    size="md"
                                                    borderRadius="xl"
                                                    mt={2}
                                                    isLoading={authLoading}
                                                    w="100%"
                                                >
                                                    Create Account & Set Address
                                                </Button>

                                                <Text textAlign="center" fontSize="xs" color={subTextColor} pt={1}>
                                                    Already have an account?{" "}
                                                    <Text
                                                        as="span"
                                                        color="red.600"
                                                        fontWeight="bold"
                                                        cursor="pointer"
                                                        onClick={() => setAuthMode("signin")}
                                                    >
                                                        Sign In
                                                    </Text>
                                                </Text>
                                            </VStack>
                                        </form>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}
                </ModalBody>

                <ModalFooter bg={footerBg} px={6} py={4} borderTop="1px solid" borderColor={footerBorder}>
                    {activeTab === "address" ? (
                        <Flex w="100%" justify="space-between" align="center">
                            <Button variant="ghost" size="sm" borderRadius="lg" onClick={onClose}>
                                Close
                            </Button>
                            <Button
                                colorScheme="red"
                                size="sm"
                                borderRadius="lg"
                                px={6}
                                onClick={handleSaveAddress}
                                isLoading={savingAddress}
                            >
                                Save Address
                            </Button>
                        </Flex>
                    ) : (
                        <Flex w="100%" justify="flex-end">
                            <Button variant="ghost" size="sm" borderRadius="lg" onClick={onClose}>
                                Close
                            </Button>
                        </Flex>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}