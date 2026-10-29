import React from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Flex,
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";

export interface AuthProtectionProps {

  allowedRoles?: string[];

  redirectTo?: string;

  unauthorizedRedirectTo?: string;
  children?: React.ReactNode;
}

export const AuthProtection: React.FC<AuthProtectionProps> = ({
  allowedRoles,
  redirectTo = "/Shopio/login",
  unauthorizedRedirectTo,
  children,
}) => {
  const { token, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "#0B1437");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");

  const isAuthenticated = Boolean(token || localStorage.getItem("jwt"));

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = (role || localStorage.getItem("role") || "").toLowerCase().trim();
    const hasAllowedRole = allowedRoles.some(
      (r) => r.toLowerCase().trim() === currentRole
    );

    if (!hasAllowedRole) {
      if (unauthorizedRedirectTo) {
        return <Navigate to={unauthorizedRedirectTo} replace />;
      }

      // Show user-friendly Access Denied UI
      return (
        <Flex
          minH="70vh"
          align="center"
          justify="center"
          p={4}
          bg={pageBg}
        >
          <Box
            bg={cardBg}
            p={8}
            borderRadius="2xl"
            boxShadow="0 10px 30px rgba(0,0,0,0.08)"
            maxW="480px"
            w="100%"
            textAlign="center"
          >
            <VStack spacing={4}>
              <Text fontSize="5xl">🔒</Text>
              <Heading size="lg" color={textColor}>
                Access Denied
              </Heading>
              <Text color={subTextColor} fontSize="sm">
                You do not have permission to view this page. This area is restricted to{" "}
                <strong>{allowedRoles.join(", ")}</strong> accounts.
              </Text>
              <Flex gap={3} pt={2}>
                <Button
                  colorScheme="blue"
                  borderRadius="full"
                  px={6}
                  onClick={() => navigate("/Shopio")}
                >
                  Return to Home
                </Button>
                <Button
                  variant="outline"
                  borderRadius="full"
                  px={6}
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </Flex>
            </VStack>
          </Box>
        </Flex>
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};


export const GuestProtection: React.FC<{
  redirectTo?: string;
  children?: React.ReactNode;
}> = ({ redirectTo = "/Shopio", children }) => {
  const { token } = useAuth();
  const isAuthenticated = Boolean(token || localStorage.getItem("jwt"));

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AuthProtection;
