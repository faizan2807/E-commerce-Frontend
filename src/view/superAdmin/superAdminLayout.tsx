import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  useColorMode,
  useColorModeValue,
  Divider,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  ChevronDown,
  Menu as MenuIcon,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { authRepository, User } from "../../api/authRepository";

export default function SuperAdminLayout() {
  const { logout, email, userId, user: contextUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(contextUser);
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const sidebarBg = useColorModeValue("white", "#111C44");
  const sidebarBorder = useColorModeValue("gray.200", "gray.700");
  const mainBg = useColorModeValue("#F4F7FE", "#0B1437");
  const headerBg = useColorModeValue("white", "#111C44");
  const headerBorder = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("black", "white");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const activeLinkBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const activeLinkColor = useColorModeValue("blue.600", "blue.300");
  const menuBg = useColorModeValue("white", "#111C44");

  useEffect(() => {
    const fetchProfile = async () => {
      if (userId && !currentUser) {
        try {
          const res = await authRepository.getUserById(userId);
          if (res && res.success && res.data) {
            setCurrentUser(res.data);
          }
        } catch {
          // Fallback gracefully
        }
      }
    };
    fetchProfile();
  }, [userId, currentUser]);

  // Sidebar navigation strictly contains: Dashboard, Products, Orders (User module removed)
  const navItems = [
    {
      label: "Dashboard",
      path: "/shopio/superadmin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      path: "/shopio/superadmin/products",
      icon: Package,
    },
    {
      label: "Orders",
      path: "/shopio/superadmin/orders",
      icon: ShoppingBag,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/Shopio/login");
  };

  const userFullName = currentUser
    ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
    : "";
  const displayName = userFullName || email || "Admin";

  const renderNavLinks = (isMobile: boolean = false) => (
    <VStack spacing={2} align="stretch" w="100%">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.path ||
          (item.path === "/shopio/superadmin/products" &&
            location.pathname === "/shopio/superadmin/product") ||
          (item.path === "/shopio/superadmin/orders" &&
            location.pathname === "/shopio/superadmin/order");

        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: "none" }}
            onClick={() => {
              if (isMobile) onClose();
            }}
          >
            <Flex
              align="center"
              gap={3}
              px={4}
              py={3}
              borderRadius="xl"
              cursor="pointer"
              transition="all 0.2s"
              bg={isActive ? activeLinkBg : "transparent"}
              color={isActive ? activeLinkColor : mutedText}
              fontWeight={isActive ? "700" : "500"}
              _hover={{
                bg: activeLinkBg,
                color: activeLinkColor,
                transform: "translateX(2px)",
              }}
            >
              <Icon size={20} />
              <Text fontSize="sm">{item.label}</Text>
            </Flex>
          </NavLink>
        );
      })}
    </VStack>
  );

  return (
    <Flex minH="100vh" bg={mainBg}>
      {/* Desktop Sidebar  */}
      <Box
        display={{ base: "none", md: "flex" }}
        w="240px"
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor={sidebarBorder}
        p={5}
        flexDirection="column"
        justifyContent="space-between"
        position="sticky"
        top="0"
        h="100vh"
        zIndex={10}
        flexShrink={0}
      >
        <Box>
          <Box mb={6} px={2} cursor="pointer" onClick={() => navigate("/shopio/superadmin/dashboard")}>
            <Image
              src="/assets/Shopio Red Cart Logo.png"
              alt="Shopio Logo"
              maxH="46px"
              objectFit="contain"
            />
          </Box>

          {/* Desktop Navigation Links */}
          <Box justifyContent={"center"} alignItems={"center"} mt={12}>
            {renderNavLinks(false)}
          </Box>

        </Box>

        {/* Bottom Actions */}
        <Box>
          <Divider my={3} borderColor={sidebarBorder} />
          <VStack spacing={2} align="stretch">
            <Button
              variant="ghost"
              leftIcon={<Store size={18} />}
              justifyContent="flex-start"
              px={4}
              color={mutedText}
              _hover={{ color: textColor, bg: activeLinkBg }}
              onClick={() => navigate("/Shopio")}
            >
              <Text>Storefront</Text>
            </Button>

            <Button
              variant="ghost"
              colorScheme="red"
              leftIcon={<LogOut size={18} />}
              justifyContent="flex-start"
              px={4}
              onClick={handleLogout}
            >
              <Text>Logout</Text>
            </Button>
          </VStack>
        </Box>
      </Box>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg={sidebarBg} maxW="260px">
          <DrawerCloseButton />
          <DrawerBody p={5} display="flex" flexDirection="column" justifyContent="space-between">
            <Box pt={4}>
              <Box mb={6} px={2} cursor="pointer" onClick={() => { navigate("/shopio/superadmin/dashboard"); onClose(); }}>
                <Image
                  src="/assets/Shopio Red Cart Logo.png"
                  alt="Shopio Logo"
                  maxH="40px"
                  objectFit="contain"
                />
              </Box>
              {renderNavLinks(true)}
            </Box>

            <Box>
              <Divider my={3} borderColor={sidebarBorder} />
              <VStack spacing={2} align="stretch">
                <Button
                  variant="ghost"
                  leftIcon={<Store size={18} />}
                  justifyContent="flex-start"
                  px={4}
                  color={mutedText}
                  _hover={{ color: textColor, bg: activeLinkBg }}
                  onClick={() => {
                    navigate("/Shopio");
                    onClose();
                  }}
                >
                  <Text>Storefront</Text>
                </Button>

                <Button
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<LogOut size={18} />}
                  justifyContent="flex-start"
                  px={4}
                  onClick={handleLogout}
                >
                  <Text>Logout</Text>
                </Button>
              </VStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content Area: Responsive with minW="0" and w="100%" */}
      <Flex flex="1" direction="column" minW="0" w="100%" overflowX="hidden">
        {/* Top Navbar */}
        <Flex
          h="70px"
          bg={headerBg}
          borderBottom="1px solid"
          borderColor={headerBorder}
          px={{ base: 3, sm: 5, md: 8 }}
          align="center"
          justify="space-between"
          position="sticky"
          top="0"
          zIndex={9}
          w="100%"
        >
          {/* Left: Mobile Menu Toggle & Title */}
          <HStack spacing={3}>
            <IconButton
              display={{ base: "inline-flex", md: "none" }}
              aria-label="Open navigation menu"
              icon={<MenuIcon size={20} />}
              variant="ghost"
              size="sm"
              onClick={onOpen}
            />
            <Box>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="bold"
                color={textColor}
                textTransform="capitalize"
              >
                {location.pathname.replace("/superadmin/", "") || "Dashboard"}
              </Text>
            </Box>
          </HStack>

          {/* Right Section: Circular login userInfo */}
          <HStack spacing={{ base: 2, sm: 3 }}>
            <Menu placement="bottom-end">
              <Tooltip label="User profile & actions" hasArrow>
                <MenuButton
                  as={Button}
                  variant="unstyled"
                  display="flex"
                  alignItems="center"
                  p={0}
                  m={0}
                  h="auto"
                  minW="auto"
                  _focus={{ boxShadow: "none" }}
                >
                  <HStack spacing={1.5} cursor="pointer">
                    <Flex
                      p="2px"
                      borderRadius="full"
                      border="2px solid"
                      borderColor="blue.500"
                      transition="transform 0.2s"
                      _hover={{ transform: "scale(1.06)" }}
                    >
                      <Avatar
                        size={{ base: "sm", sm: "md" }}
                        name={displayName}
                        bg="blue.600"
                        color="white"
                        fontWeight="bold"
                      />
                    </Flex>
                    <ChevronDown size={14} color={mutedText} />
                  </HStack>
                </MenuButton>
              </Tooltip>

              <MenuList
                bg={menuBg}
                borderColor={headerBorder}
                boxShadow="0 10px 30px rgba(0,0,0,0.15)"
                borderRadius="2xl"
                p={3}
                minW={{ base: "210px", sm: "240px" }}
              >
                {/* User Info Header in dropdown */}
                <Box px={3} py={2}>
                  <Text fontWeight="bold" fontSize="sm" color={textColor} noOfLines={1}>
                    {displayName}
                  </Text>
                </Box>

                <MenuDivider borderColor={headerBorder} />

                <MenuItem
                  icon={<Store size={16} />}
                  borderRadius="lg"
                  fontSize="sm"
                  onClick={() => navigate("/Shopio")}
                >
                  Switch to Storefront
                </MenuItem>

                <MenuItem
                  icon={colorMode === "light" ? <Moon size={16} /> : <Sun size={16} />}
                  borderRadius="lg"
                  fontSize="sm"
                  onClick={toggleColorMode}
                >
                  {colorMode === "light" ? "Dark Mode" : "Light Mode"}
                </MenuItem>

                <MenuDivider borderColor={headerBorder} />

                <MenuItem
                  icon={<LogOut size={16} />}
                  color="red.500"
                  fontWeight="600"
                  borderRadius="lg"
                  fontSize="sm"
                  onClick={handleLogout}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Content Outlet with fully responsive padding */}
        <Box p={{ base: 3, sm: 4, md: 6, lg: 8 }} flex="1" w="100%">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
