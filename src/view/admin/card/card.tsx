import React from "react";
import {
  Box,
  Image,
  Text,
  Heading,
  Button,
  Flex,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";

export interface CardProps {
  title: string;
  description?: string;
  image?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  badge?: string;
  badgeColor?: string;
  bgGradient?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  width?: any;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  image,
  icon,
  iconBg = "white",
  badge,
  badgeColor = "red",
  bgGradient,
  buttonText = "See More",
  onButtonClick,
  width = "100%",
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.900", "white");
  const descColor = useColorModeValue("gray.600", "gray.400");
  const dividerColor = useColorModeValue("gray.100", "gray.700");
  const buttonHoverBg = useColorModeValue("red.50", "whiteAlpha.100");

  return (
    <Box
      width={width}
      borderWidth="1px"
      borderColor={cardBorder}
      borderRadius="2xl"
      overflow="hidden"
      bg={cardBg}
      boxShadow="0 4px 18px -2px rgba(0, 0, 0, 0.05)"
      transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{
        transform: "translateY(-6px)",
        boxShadow: "0 22px 36px -10px rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(229, 62, 62, 0.1)",
        borderColor: "red.300",
      }}
      display="flex"
      flexDirection="column"
      cursor={onButtonClick ? "pointer" : "default"}
      onClick={onButtonClick}
      role="group"
      position="relative"
    >
      {/* Visual Header: Image or Icon Container with subtle gradient vignette */}
      {image ? (
        <Box position="relative" w="100%" aspectRatio="1 / 1" maxW="800px" maxH="800px" overflow="hidden" bg="gray.100">
          <Image
            src={image}
            alt={title}
            width="100%"
            height="100%"
            objectFit="cover"
            transition="transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
            _groupHover={{ transform: "scale(1.08)" }}
          />
          {/* Subtle gradient overlay on bottom of image for seamless transition */}
          <Box
            position="absolute"
            inset={0}
            bg="linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.05) 55%, transparent 100%)"
            pointerEvents="none"
          />

          {badge && (
            <Badge
              position="absolute"
              top={3.5}
              left={3.5}
              colorScheme={badgeColor}
              borderRadius="full"
              px={3}
              py={1}
              fontSize="2xs"
              fontWeight="bold"
              letterSpacing="0.5px"
              textTransform="uppercase"
              boxShadow="0 2px 8px rgba(0,0,0,0.2)"
              backdropFilter="blur(8px)"
            >
              {badge}
            </Badge>
          )}
        </Box>
      ) : icon ? (
        <Box
          h="180px"
          w="100%"
          bg={bgGradient || "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          p={4}
        >
          {badge && (
            <Badge
              position="absolute"
              top={3.5}
              right={3.5}
              colorScheme={badgeColor}
              borderRadius="full"
              px={3}
              py={1}
              fontSize="2xs"
              fontWeight="bold"
              boxShadow="xs"
            >
              {badge}
            </Badge>
          )}
          <Flex
            w="84px"
            h="84px"
            borderRadius="2xl"
            bg={iconBg}
            align="center"
            justify="center"
            boxShadow="0 10px 25px -4px rgba(0, 0, 0, 0.12)"
            transition="transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            _groupHover={{ transform: "scale(1.12) rotate(2deg)" }}
          >
            {icon}
          </Flex>
        </Box>
      ) : null}

      <Box p={5} display="flex" flexDirection="column" flex="1">
        <Heading
          size="md"
          mb={2}
          color={headingColor}
          fontWeight="bold"
          fontSize="md"
          letterSpacing="-0.3px"
          transition="color 0.2s"
          _groupHover={{ color: "red.400" }}
        >
          {title}
        </Heading>

        {description && (
          <Text
            color={descColor}
            fontSize="xs"
            lineHeight="1.6"
            mb={4}
            flex="1"
            noOfLines={2}
          >
            {description}
          </Text>
        )}

        {buttonText && (
          <Flex justifyContent="space-between" align="center" mt="auto" pt={3} borderTop="1px solid" borderColor={dividerColor}>
            {/* <Text fontSize="2xs" fontWeight="bold" color="red.500" textTransform="uppercase" letterSpacing="0.5px">
              View Category
            </Text> */}
            <Button
              colorScheme="red"
              variant="ghost"
              size="xs"
              borderRadius="full"
              px={2.5}
              py={1}
              rightIcon={
                <Box
                  as="span"
                  transition="transform 0.25s ease"
                  _groupHover={{ transform: "translateX(3px)" }}
                  display="inline-flex"
                >
                  <ArrowRight size={13} />
                </Box>
              }
              _hover={{
                bg: buttonHoverBg,
                color: "red.400",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onButtonClick) onButtonClick();
              }}
            >
              {buttonText}
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default Card;