import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    Image,
    Text,
    Badge,
    HStack,
    IconButton
} from "@chakra-ui/react";
import { Search2Icon, StarIcon } from "@chakra-ui/icons";
import { useDebounce } from "../../hooks/debounce/debounce";
import { productRepository, ProductsTableData } from "../../api/product";
import { getProductImageUrl } from "../../utils/imageUtils";

export default function ProductSearch() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<ProductsTableData[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedSearch = useDebounce(search, 600);


    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setProducts([]);
            return;
        }

        const fetchProducts = async () => {
            try {
                setLoading(true);

                console.log(
                    "Calling API for:",
                    debouncedSearch
                );

                const response =
                    await productRepository.getProductBySearch(
                        debouncedSearch.trim()
                    );

                if (
                    response?.success &&
                    Array.isArray(response.data)
                ) {
                    setProducts(response.data);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Search error:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [debouncedSearch]);

    return (
        <Box
            position="relative"
            flex="1"
            order={{ base: 3, md: 2 }}
            w={{ base: "100%", md: "auto" }}
            maxW={{
                base: "100%",
                md: "520px",
                lg: "650px",
            }}
            mx={{ base: 0, md: 2 }}
        >
            <InputGroup size="md">
                <InputLeftElement
                    pointerEvents="none"
                    pl={3}
                >
                    <Search2Icon
                        color="gray.400"
                        boxSize={4}
                    />
                </InputLeftElement>

                <Input
                    placeholder="Search products, brands, categories..."
                    bg="white"
                    color="gray.800"
                    fontSize="sm"
                    borderRadius="full"
                    shadow="sm"
                    border="none"
                    pl={10}
                    pr={4}
                    py={5}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    _placeholder={{
                        color: "gray.400",
                        fontSize: "sm",
                    }}
                    _focus={{
                        bg: "white",
                        boxShadow:
                            "0 0 0 3px rgba(255, 255, 255, 0.4)",
                    }}
                    _hover={{
                        bg: "gray.50",
                    }}
                />
            </InputGroup>

            {/* Search Results */}
            {search.trim() && (
                <Box
                    position="absolute"
                    top="calc(100% + 8px)"
                    left={0}
                    right={0}
                    bg="white"
                    borderRadius="md"
                    boxShadow="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    zIndex={1000}
                    maxH="500px"
                    overflowY="auto"
                >
                    {loading ? (
                        <Box p={4}>
                            <Text color="gray.500">
                                Searching...
                            </Text>
                        </Box>
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            <Box
                                key={product._id}
                                display="flex"
                                alignItems="center"
                                p={3}
                                borderBottom="1px solid"
                                borderColor="gray.100"
                                cursor="pointer"
                                onClick={() => {
                                    navigate(`/Shopio/productDetails/${product._id || product.id}`);
                                    setSearch("");
                                }}
                                _hover={{
                                    bg: "gray.50",
                                }}
                            >
                                {/* Image */}
                                <Box
                                    w="70px"
                                    h="70px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexShrink={0}
                                >
                                    <Image
                                        src={getProductImageUrl(product.image)}
                                        alt={product.title}
                                        maxW="65px"
                                        maxH="65px"
                                        objectFit="contain"
                                        fallbackSrc="https://via.placeholder.com/65x65?text=No+Image"
                                    />
                                </Box>

                                {/* Details */}
                                <Box
                                    flex="1"
                                    ml={3}
                                    minW={0}
                                >
                                    <Text
                                        fontSize="sm"
                                        fontWeight="500"
                                        color="gray.800"
                                        noOfLines={2}
                                    >
                                        {product.title}
                                    </Text>

                                    <HStack
                                        mt={1}
                                        spacing={2}
                                    >
                                        <Badge
                                            colorScheme="green"
                                            fontSize="xs"
                                        >
                                            ⭐{" "}
                                            {product.rating?.rate ??
                                                "4.0"}
                                        </Badge>

                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                        >
                                            {product.rating?.count ??
                                                0}{" "}
                                            Ratings
                                        </Text>
                                    </HStack>

                                    <HStack
                                        mt={1}
                                        spacing={2}
                                    >
                                        <Text
                                            fontSize="md"
                                            fontWeight="bold"
                                        >
                                            ₹{product.price}
                                        </Text>

                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            textDecoration="line-through"
                                        >
                                            ₹
                                            {Math.round(
                                                product.price * 1.2
                                            )}
                                        </Text>

                                        <Text
                                            fontSize="xs"
                                            color="green.500"
                                            fontWeight="bold"
                                        >
                                            20% off
                                        </Text>
                                    </HStack>
                                </Box>

                                <IconButton
                                    aria-label="Add to wishlist"
                                    icon={<StarIcon />}
                                    variant="ghost"
                                    size="sm"
                                />
                            </Box>
                        ))
                    ) : (
                        <Box p={4}>
                            <Text
                                fontSize="sm"
                                color="gray.500"
                            >
                                No products found
                            </Text>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}