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
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

export default function Verification() {
    return (
        <Flex direction="column" w="100%" minH="100vh">
            {/* Top Blue Area */}
            <Box
                bg="red.400"
                h="350px"
                w="100%"
            >
                <Flex
                    h="100%"
                    justify="center"
                    align="center"
                    direction="column"
                    color="white"
                >
                    <Heading size="2xl" mb={4}>
                      Enter Your Token For Verification
                    </Heading>
                </Flex>
            </Box>

            {/* Login Card */}
            <Flex
                justify="center"
                mt="-130px"
                px={4}
                flex="1"
            >
                <Box
                    w="100%"
                    maxW="450px"
                    bg="white"
                    p={8}
                    height="100%"
                    borderRadius="2xl"
                    boxShadow="2xl"
                >
                 
                    <FormControl mb={5}>
                        <FormLabel>Verification</FormLabel>
                        <Input
                            placeholder="Enter Token"
                            size="lg"
                        />
                    </FormControl>
                    <Button
                        colorScheme="red"
                        w="100%"
                        size="lg"
                        mb={6}
                    >
                        Verify
                    </Button>

                </Box>
            </Flex>
        </Flex>
    );
}

