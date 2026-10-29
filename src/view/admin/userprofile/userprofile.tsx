import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Box,
  Flex,
  Badge,
  Grid,
  InputGroup,
  InputLeftElement,
  Spinner,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { authRepository, User } from "../../../api/authRepository";
import { useAuth } from "../../../context/AuthContext";
import { useCenterAlert } from "../../../context/AlertContext";
import {
  Heart,
  LogOut,
  ShoppingBag,
  UserRound,
  Mail,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
}: ProfileModalProps) {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useCenterAlert();

  const modalBg = useColorModeValue("white", "gray.800");
  const modalBorder = useColorModeValue("gray.100", "gray.700");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const inputBg = useColorModeValue("white", "gray.900");
  const inputBorder = useColorModeValue("gray.200", "gray.600");
  const subHeadingColor = useColorModeValue("gray.500", "gray.400");
  const dividerColor = useColorModeValue("gray.100", "gray.700");
  const footerBg = useColorModeValue("gray.50", "gray.900");
  const footerBorder = useColorModeValue("gray.100", "gray.700");
  const cancelBtnColor = useColorModeValue("gray.600", "gray.400");
  const wishlistCardBg = useColorModeValue("pink.50", "rgba(236, 72, 153, 0.12)");
  const wishlistCardBorder = useColorModeValue("pink.100", "rgba(236, 72, 153, 0.3)");
  const wishlistCardHover = useColorModeValue("pink.100", "rgba(236, 72, 153, 0.2)");
  const wishlistCardIconBg = useColorModeValue("white", "gray.800");
  const wishlistTitle = useColorModeValue("pink.900", "pink.200");
  const wishlistSub = useColorModeValue("pink.700", "pink.300");
  const ordersCardBg = useColorModeValue("blue.50", "rgba(59, 130, 246, 0.12)");
  const ordersCardBorder = useColorModeValue("blue.100", "rgba(59, 130, 246, 0.3)");
  const ordersCardHover = useColorModeValue("blue.100", "rgba(59, 130, 246, 0.2)");
  const ordersCardIconBg = useColorModeValue("white", "gray.800");
  const ordersTitle = useColorModeValue("blue.900", "blue.200");
  const ordersSub = useColorModeValue("blue.700", "blue.300");

  const [profile, setProfile] = useState<User>({} as User);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle input changes
  const handleChange = (
    field: keyof User,
    value: string | number
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!isOpen) return;

    if (!userId) {
      onClose();
      navigate("/Shopio/login");
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await authRepository.getUserById(userId);

        if (response && response.data) {
          const data = response.data;
          setProfile({
            ...data,
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            email: data.email ?? "",
            contact: data.contact ?? "",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isOpen, userId, navigate, onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    showAlert({
      title: "Signed Out",
      description: "You have signed out of your account successfully.",
      status: "info",
      duration: 2000,
    });
    navigate("/Shopio/login");
  };

  // Save updated user
  const handleSave = async () => {
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    try {
      setSaving(true);

      const updated = await authRepository.updateuser(
        userId,
        profile
      );

      setProfile(updated);

      showAlert({
        title: "Profile Updated!",
        description: "Your user profile changes have been saved successfully.",
        status: "success",
        duration: 2500,
      });

      onClose();
    } catch (error: any) {
      console.error("Error updating user:", error);
      showAlert({
        title: "Update Failed",
        description: error.response?.data?.message || "Could not update user profile.",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : "Shopio Member";

  const userInitial = profile.firstName
    ? profile.firstName.charAt(0).toUpperCase()
    : profile.email
      ? profile.email.charAt(0).toUpperCase()
      : "U";

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
        {/* Top Decorative Hero Banner */}
        <Box
          bg="linear-gradient(135deg, #e53e3e 0%, #c53030 50%, #9b2c2c 100%)"
          pt={7}
          pb={10}
          px={6}
          position="relative"
          color="white"
        >
          <ModalCloseButton
            position="absolute"
            top={4}
            right={4}
            color="white"
            borderRadius="full"
            _hover={{ bg: "whiteAlpha.300" }}
          />

          <Flex align="center" gap={4}>
            {/* User Avatar Circle */}
            <Flex
              w="64px"
              h="64px"
              borderRadius="full"
              bg="white"
              color="red.600"
              fontSize="2xl"
              fontWeight="extrabold"
              align="center"
              justify="center"
              boxShadow="0 8px 16px rgba(0,0,0,0.15)"
              border="3px solid rgba(255,255,255,0.85)"
              flexShrink={0}
            >
              {userInitial}
            </Flex>

            {/* Profile Greeting & Status */}
            <Box flex="1">
              <HStack spacing={2} mb={1}>
                <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                  {displayName}
                </Text>
                <Badge
                  bg="whiteAlpha.300"
                  color="white"
                  fontSize="2xs"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                >
                  {profile.role || "Verified User"}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="whiteAlpha.800" noOfLines={1}>
                {profile.email || "No email registered"}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Modal Body */}
        <ModalBody px={6} pt={5} pb={6}>
          {loading ? (
            <VStack py={12} spacing={3}>
              <Spinner color="red.500" size="lg" thickness="3px" />
              <Text fontSize="sm" color={subHeadingColor}>
                Loading your profile details...
              </Text>
            </VStack>
          ) : (
            <VStack spacing={5} align="stretch">
              {/* Quick Navigation Cards: Wishlist & Orders */}
              <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                {/* Wishlist Card */}
                <Flex
                  align="center"
                  p={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={wishlistCardBorder}
                  bg={wishlistCardBg}
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: wishlistCardHover,
                    transform: "translateY(-2px)",
                    boxShadow: "sm",
                  }}
                  onClick={() => {
                    onClose();
                    navigate("/Shopio/favourite");
                  }}
                >
                  <Flex
                    w="38px"
                    h="38px"
                    borderRadius="lg"
                    bg={wishlistCardIconBg}
                    color="pink.500"
                    align="center"
                    justify="center"
                    mr={3}
                    boxShadow="xs"
                    flexShrink={0}
                  >
                    <Heart size={20} fill="#ec4899" color="#ec4899" />
                  </Flex>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={wishlistTitle}>
                      My Wishlist
                    </Text>
                    <Text fontSize="2xs" color={wishlistSub}>
                      Saved products
                    </Text>
                  </Box>
                </Flex>

                {/* Orders Card */}
                <Flex
                  align="center"
                  p={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={ordersCardBorder}
                  bg={ordersCardBg}
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: ordersCardHover,
                    transform: "translateY(-2px)",
                    boxShadow: "sm",
                  }}
                  onClick={() => {
                    onClose();
                    navigate("/Shopio/order");
                  }}
                >
                  <Flex
                    w="38px"
                    h="38px"
                    borderRadius="lg"
                    bg={ordersCardIconBg}
                    color="blue.600"
                    align="center"
                    justify="center"
                    mr={3}
                    boxShadow="xs"
                    flexShrink={0}
                  >
                    <ShoppingBag size={20} />
                  </Flex>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={ordersTitle}>
                      My Orders
                    </Text>
                    <Text fontSize="2xs" color={ordersSub}>
                      Track & history
                    </Text>
                  </Box>
                </Flex>
              </Grid>

              <Divider borderColor={dividerColor} />

              {/* Editable Information Header */}
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color={subHeadingColor}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  mb={3}
                >
                  Personal Information
                </Text>

                {/* First Name & Last Name */}
                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3} mb={3.5}>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                      First Name
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" color="gray.400">
                        <UserRound size={16} />
                      </InputLeftElement>
                      <Input
                        pl={9}
                        borderRadius="xl"
                        fontSize="sm"
                        bg={inputBg}
                        borderColor={inputBorder}
                        _focus={{
                          borderColor: "red.400",
                          boxShadow: "0 0 0 1px #e53e3e",
                        }}
                        placeholder="First Name"
                        value={profile.firstName ?? ""}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                      />
                    </InputGroup>
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
                      _focus={{
                        borderColor: "red.400",
                        boxShadow: "0 0 0 1px #e53e3e",
                      }}
                      placeholder="Last Name"
                      value={profile.lastName ?? ""}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                    />
                  </FormControl>
                </Grid>

                {/* Email Address & Contact Number */}
                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3}>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                      Email Address
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" color="gray.400">
                        <Mail size={16} />
                      </InputLeftElement>
                      <Input
                        type="email"
                        pl={9}
                        borderRadius="xl"
                        fontSize="sm"
                        bg={inputBg}
                        borderColor={inputBorder}
                        _focus={{
                          borderColor: "red.400",
                          boxShadow: "0 0 0 1px #e53e3e",
                        }}
                        placeholder="email@example.com"
                        value={profile.email ?? ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color={labelColor} mb={1}>
                      Contact Number
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" color="gray.400">
                        <Phone size={16} />
                      </InputLeftElement>
                      <Input
                        type="tel"
                        pl={9}
                        borderRadius="xl"
                        fontSize="sm"
                        bg={inputBg}
                        borderColor={inputBorder}
                        _focus={{
                          borderColor: "red.400",
                          boxShadow: "0 0 0 1px #e53e3e",
                        }}
                        placeholder="e.g. 9876543210"
                        value={profile.contact ?? ""}
                        onChange={(e) => handleChange("contact", e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>
                </Grid>
              </Box>
            </VStack>
          )}
        </ModalBody>

        {/* Modal Footer with Actions */}
        <ModalFooter
          bg={footerBg}
          px={6}
          py={3.5}
          borderTop="1px solid"
          borderColor={footerBorder}
        >
          <Flex w="100%" justify="space-between" align="center">
            {/* Sign Out Button */}
            <Button
              leftIcon={<LogOut size={16} />}
              colorScheme="red"
              variant="ghost"
              size="sm"
              borderRadius="lg"
              fontWeight="semibold"
              _hover={{ bg: "red.50" }}
              onClick={handleLogout}
            >
              Sign Out
            </Button>

            {/* Cancel & Save Buttons */}
            <HStack spacing={2}>
              <Button
                variant="ghost"
                size="sm"
                borderRadius="lg"
                color={cancelBtnColor}
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                colorScheme="red"
                size="sm"
                borderRadius="lg"
                px={5}
                fontWeight="bold"
                onClick={handleSave}
                isLoading={saving}
                isDisabled={!userId || loading}
              >
                Save Changes
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}