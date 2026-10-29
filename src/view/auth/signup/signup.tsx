import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    SimpleGrid,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCenterAlert } from "../../../context/AlertContext";
import {
    firstNameSchema,
    lastNameSchema,
    contactEmailSchema,
    contactNumberSchema,
    loginPasswordSchema,
} from "../../../validations/validation";
import { Eye, EyeOff } from "lucide-react";

export default function SignUp() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const { showAlert } = useCenterAlert();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const pageBg = useColorModeValue("#f8fafc", "#0b1120");
    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.900", "white");
    const labelColor = useColorModeValue("gray.700", "gray.300");
    const inputBg = useColorModeValue("white", "gray.900");
    const inputBorder = useColorModeValue("gray.200", "gray.600");
    const mutedColor = useColorModeValue("gray.500", "gray.400");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        contact: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<{
        firstName?: string;
        lastName?: string;
        contact?: string;
        email?: string;
        password?: string;
    }>({});

    const validateField = (field: keyof typeof formData, value: string) => {
        let result: { success: boolean; error?: any } = { success: true };

        if (field === "firstName") result = firstNameSchema.safeParse(value);
        else if (field === "lastName") result = lastNameSchema.safeParse(value);
        else if (field === "contact") result = contactNumberSchema.safeParse(value);
        else if (field === "email") result = contactEmailSchema.safeParse(value);
        else if (field === "password") result = loginPasswordSchema.safeParse(value);

        setErrors((prev) => ({
            ...prev,
            [field]: result.success ? "" : result.error?.issues?.[0]?.message || "Invalid input",
        }));
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    const handleRegister = async () => {
        if (loading) return;

        // Validate all fields
        const vFirst = firstNameSchema.safeParse(formData.firstName);
        const vLast = lastNameSchema.safeParse(formData.lastName);
        const vContact = contactNumberSchema.safeParse(formData.contact);
        const vEmail = contactEmailSchema.safeParse(formData.email);
        const vPass = loginPasswordSchema.safeParse(formData.password);

        const newErrors = {
            firstName: vFirst.success ? "" : vFirst.error.issues[0].message,
            lastName: vLast.success ? "" : vLast.error.issues[0].message,
            contact: vContact.success ? "" : vContact.error.issues[0].message,
            email: vEmail.success ? "" : vEmail.error.issues[0].message,
            password: vPass.success ? "" : vPass.error.issues[0].message,
        };

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some((err) => Boolean(err));
        if (hasErrors) {
            showAlert({
                title: "Validation Error",
                description: "Please fix the highlighted fields to continue.",
                status: "warning",
            });
            return;
        }

        setLoading(true);
        try {
            await signUp({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                contact: Number(formData.contact),
                password: formData.password,
                role: "user",
            });

            showAlert({
                title: "Account Created Successfully",
                description: "Welcome to Shopio! Redirecting to sign in...",
                status: "success",
                duration: 2000,
                onConfirm: () => navigate("/Shopio/login"),
            });

            setTimeout(() => {
                navigate("/Shopio/login");
            }, 1200);
        } catch (error: any) {
            showAlert({
                title: "Registration Failed",
                description:
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    "Could not complete signup",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex direction="column" w="100%" minH="100vh" bg={pageBg}>
            {/* Top Red Header Banner */}
            <Box
                bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                h={{ base: "180px", md: "280px" }}
                w="100%"
            />

            {/* Signup Card */}
            <Flex justify="center" mt={{ base: "-110px", md: "-190px" }} px={{ base: 3, sm: 6 }} flex="1" pb={10}>
                <Box
                    w="100%"
                    maxW="480px"
                    bg={cardBg}
                    p={{ base: 5, sm: 8, md: 10 }}
                    borderRadius="2xl"
                    boxShadow="2xl"
                    border="1px solid"
                    borderColor={cardBorder}
                    mb={8}
                >
                    <Heading size="xl" mb={4} textAlign="left" mt="-15px" color={headingColor}>
                        Sign Up
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                        <FormControl isInvalid={Boolean(errors.firstName)}>
                            <FormLabel fontSize="sm" color={labelColor}>First Name</FormLabel>
                            <Input
                                placeholder="Enter FirstName"
                                size="lg"
                                bg={inputBg}
                                borderColor={inputBorder}
                                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                            />
                            {errors.firstName && (
                                <FormErrorMessage fontSize="xs">
                                    {errors.firstName}
                                </FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl isInvalid={Boolean(errors.lastName)}>
                            <FormLabel fontSize="sm" color={labelColor}>Last Name</FormLabel>
                            <Input
                                placeholder="Enter LastName"
                                size="lg"
                                bg={inputBg}
                                borderColor={inputBorder}
                                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                            />
                            {errors.lastName && (
                                <FormErrorMessage fontSize="xs">
                                    {errors.lastName}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                    </SimpleGrid>

                    <FormControl mb={4} isInvalid={Boolean(errors.contact)}>
                        <FormLabel fontSize="sm" color={labelColor}>Contact Number</FormLabel>
                        <Input
                            placeholder="Enter 10-digit contact number"
                            size="lg"
                            type="tel"
                            bg={inputBg}
                            borderColor={inputBorder}
                            _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                            value={formData.contact}
                            onChange={(e) => handleInputChange("contact", e.target.value)}
                        />
                        {errors.contact && (
                            <FormErrorMessage fontSize="xs">
                                {errors.contact}
                            </FormErrorMessage>
                        )}
                    </FormControl>

                    <FormControl mb={4} isInvalid={Boolean(errors.email)}>
                        <FormLabel fontSize="sm" color={labelColor}>Email</FormLabel>
                        <Input
                            placeholder="Enter email address"
                            size="lg"
                            type="email"
                            bg={inputBg}
                            borderColor={inputBorder}
                            _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                        {errors.email && (
                            <FormErrorMessage fontSize="xs">
                                {errors.email}
                            </FormErrorMessage>
                        )}
                    </FormControl>

                    <FormControl mb={5} isInvalid={Boolean(errors.password)}>
                        <FormLabel fontSize="sm" color={labelColor}>Password</FormLabel>
                        <InputGroup size="lg">
                            <Input
                                placeholder="Enter password (min 8 characters)"
                                type={showPassword ? "text" : "password"}
                                bg={inputBg}
                                borderColor={inputBorder}
                                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                            <InputRightElement>
                                <IconButton
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            </InputRightElement>
                        </InputGroup>
                        {errors.password && (
                            <FormErrorMessage fontSize="xs">
                                {errors.password}
                            </FormErrorMessage>
                        )}
                    </FormControl>

                    <Button
                        colorScheme="red"
                        w="100%"
                        size="lg"
                        mb={6}
                        isLoading={loading}
                        loadingText="Creating Account..."
                        onClick={handleRegister}
                    >
                        Sign Up
                    </Button>

                    <Text textAlign="center" fontSize="sm" color={mutedColor}>
                        Already have an account?{" "}
                        <NavLink to="/Shopio/login">
                            <Text as="span" color="red.400" fontWeight="bold">
                                Sign In
                            </Text>
                        </NavLink>
                    </Text>
                </Box>
            </Flex>
        </Flex>
    );
}

