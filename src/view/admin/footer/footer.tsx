import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Text,
  VStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Copyright,
  Info,
} from "lucide-react";

export default function Footer() {
  const bgcolor = useColorModeValue("#1e293b", "#060911");
  const textcolor = useColorModeValue("white", "#cbd5e1");
  const headcolor = useColorModeValue("#94a3b8", "#64748b");
  const borderColor = useColorModeValue("transparent", "#1e293b");

  return (
    <Box
      w="100%"
      bg={bgcolor}
      color={textcolor}
      mt={6}
      borderTop="1px solid"
      borderColor={borderColor}
      transition="background-color 0.2s ease"
    >

      <Grid
        templateColumns={{
          base: "1fr",
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr 1fr 1.4fr 1.4fr",
        }}
        gap={{ base: 8, lg: 6 }}
        px={{ base: 6, md: 10, lg: 16 }}
        py={12}
      >
        {/* ABOUT */}
        <GridItem>
          <Text color={headcolor} mb={4}>
            ABOUT
          </Text>

          <VStack align="start" spacing={1}>
            <Text fontWeight="600">Contact Us</Text>
            <Text fontWeight="600">About Us</Text>
            <Text fontWeight="600">Careers</Text>
          </VStack>
        </GridItem>

        <GridItem>
          <Text color={headcolor} mb={4}>
            HELP
          </Text>

          <VStack align="start" spacing={1}>
            <Text fontWeight="600">Payments</Text>
            <Text fontWeight="600">Shipping</Text>
            <Text fontWeight="600">Cancellation & Returns</Text>
            <Text fontWeight="600">FAQ</Text>
          </VStack>
        </GridItem>

        <GridItem>
          <Text color={headcolor} mb={4}>
            CONSUMER POLICY
          </Text>

          <VStack align="start" spacing={1}>
            <Text fontWeight="600">Cancellation & Returns</Text>
            <Text fontWeight="600">Terms Of Use</Text>
            <Text fontWeight="600">Security</Text>
            <Text fontWeight="600">Privacy</Text>
          </VStack>
        </GridItem>

        <GridItem
          borderLeft={{ base: "none", lg: "1px solid #454545" }}
          pl={{ base: 0, lg: 8 }}
        >
          <Text color={headcolor} mb={4}>
            Mail Us:
          </Text>

          <Text
            fontSize="sm"
            lineHeight="1.6"
            fontWeight="500"
          >
            Shopio Private Limited,
            <br />
            Beside Park Continental Hotel,
            <br />
            Masab Tank, Hyderabad - 500028,
            <br />
            Telangana, India
          </Text>
        </GridItem>

        <GridItem>
          <Text color={headcolor} mb={4}>
            Registered Office Address:
          </Text>

          <Text
            fontSize="sm"
            lineHeight="1.6"
            fontWeight="500"
          >
            Shopio Private Limited,
            <br />
            Beside Park Continental Hotel,
            <br />
            Masab Tank, Hyderabad - 500028,
            <br />
            Telangana, India
            <br />
            <br />

            <Text as="span" color="#2874f0">
              Telephone: 044-45614709 / 044-45714709
            </Text>
          </Text>
        </GridItem>
      </Grid>
      <Divider borderColor="#454545" />

      <Flex
        minH="85px"
        px={{ base: 6, md: 10, lg: 16 }}
        align="center"
        justify="space-between"
        gap={6}
        flexWrap="wrap"
      >

        {/* Help Center */}
        <HStack>
          <Info size={"15px"} />
          <Text fontSize="sm">Help Center</Text>
        </HStack>

        {/* Copyright */}
        <HStack>
          <Copyright size={16} />
          <Text fontSize="sm">2026 Shopio.com</Text>
        </HStack>


      </Flex>
    </Box>
  );
}