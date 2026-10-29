import {
    Box,
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCenterAlert } from "../../../context/AlertContext";
import { useState } from "react";
import { signInSchema } from "../../../validations/validation";

export default function SignIn() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/Shopio";
    const { showAlert } = useCenterAlert();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [fromData, setFormData] = useState({
        email: "",
        password: "",
    });

    const pageBg = useColorModeValue("#f8fafc", "#0b1120");
    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.900", "white");
    const labelColor = useColorModeValue("gray.700", "gray.300");
    const inputBg = useColorModeValue("white", "gray.900");
    const inputBorder = useColorModeValue("gray.200", "gray.600");
    const mutedColor = useColorModeValue("gray.500", "gray.400");

    const handleInputChange = (field: "email" | "password", value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        const fieldSchema = signInSchema.shape[field];
        if (fieldSchema) {
            const result = fieldSchema.safeParse(value);
            setErrors((prev) => ({
                ...prev,
                [field]: result.success ? "" : result.error.issues[0].message,
            }));
        }
    };

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await signIn(fromData);
            const userRole = (localStorage.getItem("role") || "").toLowerCase().trim();
            const isAdmin = userRole === "admin";
            const targetPath = isAdmin ? "/superadmin/dashboard" : redirectTo;

            showAlert({
                title: "Login Successful",
                description: isAdmin
                    ? "Welcome back, Admin! Redirecting to Admin Portal..."
                    : "Welcome back to Shopio! Your cart items are synced.",
                status: "success",
                duration: 2000,
                onConfirm: () => navigate(targetPath),
            });
            setTimeout(() => {
                navigate(targetPath);
            }, 1200);
        } catch (error: any) {
            showAlert({
                title: "Login Failed",
                description: error.response?.data?.message || "Invalid credentials. Please try again.",
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
                h={{ base: "200px", md: "300px" }}
                w="100%"
            >
                <Flex
                    h="100%"
                    justify="center"
                    align="center"
                    direction="column"
                    color="white"
                >
                    <Heading size={{ base: "xl", md: "2xl" }}>
                        Welcome Back!
                    </Heading>
                    <Text fontSize="md" fontWeight={"bold"} color="white" mt={1}>
                        Sign in to continue to your Shopio account
                    </Text>
                </Flex>
            </Box>

            {/* Login Card */}
            <Flex
                justify="center"
                mt={{ base: "-60px", md: "-100px" }}
                px={{ base: 3, sm: 6 }}
                flex="1"
                pb={10}
            >
                <Box
                    w="100%"
                    maxW="450px"
                    bg={cardBg}
                    p={{ base: 6, md: 8 }}
                    borderRadius="2xl"
                    boxShadow="2xl"
                    border="1px solid"
                    borderColor={cardBorder}
                    mb={8}
                >
                    {/* Your form */}
                    <Heading size="xl" mb={4} textAlign="left" mt="-15px" color={headingColor}>
                        Sign In
                    </Heading>
                    <FormControl mb={5}>
                        <FormLabel color={labelColor}>Email</FormLabel>
                        <Input
                            placeholder="Enter email"
                            size="lg"
                            bg={inputBg}
                            borderColor={inputBorder}
                            _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                            value={fromData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                        {errors.email && (
                            <Text color="red.500" fontSize="sm" mt={1}>
                                {errors.email}
                            </Text>
                        )}
                    </FormControl>

                    <FormControl mb={5}>
                        <FormLabel color={labelColor}>Password</FormLabel>

                        <InputGroup>
                            <Input
                                placeholder="Enter password"
                                type="password"
                                size="lg"
                                bg={inputBg}
                                borderColor={inputBorder}
                                _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                value={fromData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                            <InputRightElement />
                        </InputGroup>
                    </FormControl>

                    <Flex justify="space-between" mb={6} align="center">
                        <Checkbox colorScheme="red" color={mutedColor}>Remember me</Checkbox>

                        <NavLink to="/forgot-password">
                            <Text color="red.400" fontSize="sm" fontWeight="semibold">
                                Forgot Password?
                            </Text>
                        </NavLink>
                    </Flex>

                    <Button
                        colorScheme="red"
                        w="100%"
                        size="lg"
                        mb={6}
                        isLoading={loading}
                        onClick={handleSubmit}
                    >
                        Sign In
                    </Button>

                    <Text textAlign="center" color={mutedColor} fontSize="sm">
                        Don't have an account?{" "}
                        <NavLink to="/Shopio/register">
                            <Text
                                as="span"
                                color="red.400"
                                fontWeight="bold"
                            >
                                Sign Up
                            </Text>
                        </NavLink>
                    </Text>

                </Box>
            </Flex>
        </Flex>
    );
}

