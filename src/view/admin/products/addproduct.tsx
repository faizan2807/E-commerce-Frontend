import {
    Flex,
    FormControl,
    Text,
    Button,
    Input,
    Select,
    HStack,
    Box,
    CloseButton,
    Heading,
    Container,
    SimpleGrid,
    Spinner,
    Image,
    useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCenterAlert } from "../../../context/AlertContext";
import { ProductFormData, productRepository } from "../../../api/product";
import { getProductImageUrl } from "../../../utils/imageUtils";
import { ArrowLeft } from "lucide-react";

export default function AddProducts() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit");
    const isEditMode = Boolean(editId);

    const { userId } = useAuth();
    const { showAlert } = useCenterAlert();

    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.800", "white");
    const subColor = useColorModeValue("gray.500", "gray.400");
    const labelColor = useColorModeValue("gray.700", "gray.300");
    const inputBg = useColorModeValue("white", "gray.900");
    const inputBorder = useColorModeValue("gray.200", "gray.600");
    const uploadBg = useColorModeValue("gray.50", "gray.900");
    const uploadBorder = useColorModeValue("gray.300", "gray.600");

    const [imagePreview, setImagePreview] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<ProductFormData>({
        title: "",
        description: "",
        price: 0,
        category: "",
        image: [],
        rating: {
            rate: 0,
            count: 0,
        },
        brand: "",
        status: "",
        sellerId: "",
    });

    useEffect(() => {
        if (editId) {
            const fetchProductData = async () => {
                try {
                    setIsLoadingProduct(true);
                    const res: any = await productRepository.getProductById(editId);
                    const raw = res?.data ?? res?.product ?? res;
                    const single = Array.isArray(raw) ? raw[0] : raw;
                    if (single) {
                        setFormData({
                            title: single.title || "",
                            description: single.description || "",
                            price: single.price || 0,
                            category: single.category || "",
                            image: Array.isArray(single.image) ? single.image : (single.image ? [single.image] : []),
                            rating: single.rating || { rate: 0, count: 0 },
                            brand: single.brand || "",
                            status: single.status || "",
                            sellerId: single.sellerId || "",
                        });
                        if (single.image && single.image.length > 0) {
                            setImagePreview(getProductImageUrl(single.image[0]));
                        }
                    }
                } catch (error: any) {
                    console.error("Failed to fetch product for editing:", error);
                    showAlert({
                        title: "Error Loading Product",
                        description: error.response?.data?.message || "Could not retrieve product details.",
                        status: "error",
                    });
                } finally {
                    setIsLoadingProduct(false);
                }
            };

            fetchProductData();
        }
    }, [editId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            showAlert({
                title: "Missing Product Name",
                description: "Please enter a product title before submitting.",
                status: "warning",
            });
            return;
        }

        if (!isEditMode && !imageFile) {
            showAlert({
                title: "Missing Product Image",
                description: "Please select an image for your product before submitting.",
                status: "warning",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const data = new FormData();

            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("price", String(formData.price));
            data.append("category", formData.category);
            if (imageFile) {
                data.append("image", imageFile);
            }
            data.append("brand", formData.brand);
            data.append("status", formData.status);
            data.append("sellerId", formData.sellerId || userId || "");

            if (isEditMode && editId) {
                const response = await productRepository.updateproduct(editId, data);
                console.log("Product updated:", response);
                showAlert({
                    title: "Product Updated Successfully",
                    description: `"${formData.title}" has been successfully updated.`,
                    status: "success",
                });
                navigate("/Shopio/superadmin/products");
            } else {
                const response = await productRepository.postproduct(data);
                showAlert({
                    title: "Product Added Successfully",
                    description: `${formData.title} has been added to the store.`,
                    status: "success",
                });

                // Reset form
                setFormData({
                    title: "",
                    description: "",
                    price: 0,
                    category: "",
                    image: [],
                    rating: {
                        rate: 0,
                        count: 0,
                    },
                    brand: "",
                    status: "",
                    sellerId: "",
                });
                setImageFile(null);
                setImagePreview("");
                navigate("/Shopio/superadmin/products");
            }
        } catch (error: any) {
            console.error("Error submitting product:", error);
            showAlert({
                title: isEditMode ? "Failed to Update Product" : "Failed to Add Product",
                description:
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    "Something went wrong while saving the product.",
                status: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxW="850px" py={8} px={{ base: 3, md: 6 }}>
            <Flex mb={6} justify="space-between" align="center">
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft size={16} />}
                    onClick={() => navigate("/Shopio/superadmin/products")}
                    colorScheme="red"
                >
                    Back to Products
                </Button>
                <Image
                    src="/assets/Shopio Red Cart Logo.png"
                    alt="Shopio Logo"
                    maxH="38px"
                    objectFit="contain"
                    cursor="pointer"
                    onClick={() => navigate("/Shopio")}
                />
            </Flex>

            <Box
                w="100%"
                bg={cardBg}
                p={{ base: 5, md: 8 }}
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor={cardBorder}
            >
                <Flex justifyContent="space-between" alignItems="center" mb={6}>
                    <Box>
                        <Heading size="lg" color={headingColor} fontWeight="bold">
                            {isEditMode ? "Edit Product" : "Add New Product"}
                        </Heading>
                        <Text fontSize="sm" color={subColor} mt={1}>
                            {isEditMode
                                ? "Update the details and specifications for your item"
                                : "Fill in the details below to list your item in the store"}
                        </Text>
                    </Box>
                    <CloseButton size="lg" onClick={() => navigate("/Shopio/superadmin/products")} />
                </Flex>

                {isLoadingProduct ? (
                    <Flex justify="center" align="center" minH="280px" direction="column" gap={3}>
                        <Spinner size="xl" color="red.500" thickness="4px" />
                        <Text color={subColor} fontSize="sm">
                            Loading product details...
                        </Text>
                    </Flex>
                ) : (
                    <>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }} mb={3}>
                            <FormControl>
                                <Text fontSize="sm" fontWeight="bold" color={labelColor} mb={1}>Product Name</Text>
                                <Input
                                    type="text"
                                    placeholder="Enter Product Name"
                                    bg={inputBg}
                                    borderColor={inputBorder}
                                    _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value
                                        })
                                    }
                                />
                            </FormControl>
                            <FormControl>
                                <Text fontSize="sm" fontWeight="bold" color={labelColor} mb={1}>Brand Name</Text>
                                <Input
                                    type="text"
                                    placeholder="Enter Brand Name"
                                    bg={inputBg}
                                    borderColor={inputBorder}
                                    _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                    value={formData.brand}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            brand: e.target.value
                                        })
                                    }
                                />
                            </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }} mb={3}>
                            <FormControl>
                                <Text fontSize="sm" fontWeight="bold" color={labelColor} mb={1}>Price</Text>
                                <Input
                                    type="number"
                                    placeholder="Enter Price"
                                    bg={inputBg}
                                    borderColor={inputBorder}
                                    _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            price: Number(e.target.value)
                                        })
                                    }
                                />
                            </FormControl>
                            <FormControl>
                                <Text fontSize="sm" fontWeight="bold" color={labelColor} mb={1}>Category</Text>
                                <Input
                                    type="text"
                                    placeholder="Enter Category"
                                    bg={inputBg}
                                    borderColor={inputBorder}
                                    _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value
                                        })
                                    }
                                />
                            </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }} mb={3}>
                            <FormControl>
                                <Text fontSize="sm" fontWeight="bold" color={labelColor} mb={1}>Product Description</Text>
                                <Input
                                    type="text"
                                    placeholder="Enter Product Description"
                                    bg={inputBg}
                                    borderColor={inputBorder}
                                    _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value
                                        })
                                    }
                                />
                            </FormControl>
                            <FormControl>
                                <Text fontSize="sm" fontWeight="bold" color={labelColor} mb={1}>Status</Text>
                                <Select
                                    name="status"
                                    bg={inputBg}
                                    borderColor={inputBorder}
                                    _focus={{ borderColor: "red.400", boxShadow: "0 0 0 1px #e53e3e" }}
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value as "Available" | "Unavailable" | "Out Of Stock",
                                        })
                                    }
                                >
                                    <option value="select status">Select Status</option>
                                    <option value="Available">Available</option>
                                    <option value="Unavailable">Unavailable</option>
                                    <option value="Out Of Stock">Out Of Stock</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>

                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            border="2px dashed"
                            borderColor={uploadBorder}
                            bg={uploadBg}
                            borderRadius="xl"
                            p={4}
                            minH="100px"
                            cursor="pointer"
                            position="relative"
                            overflow="hidden"
                            mt={2}
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Product preview"
                                    style={{
                                        width: "100%",
                                        height: "180px",
                                        objectFit: "contain",
                                    }}
                                />
                            ) : (
                                <>
                                    <Text fontSize="lg" fontWeight="600" color={headingColor}>
                                        Upload Product Image
                                    </Text>

                                    <Text fontSize="sm" color={subColor}>
                                        PNG, JPG or JPEG
                                    </Text>
                                </>
                            )}

                            <Input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                position="absolute"
                                inset={0}
                                opacity={0}
                                cursor="pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                }}
                            />
                        </Flex>

                        {isEditMode && imagePreview && (
                            <Text fontSize="xs" color={subColor} mt={1} textAlign="center">
                                Tip: Click on the image above if you wish to upload a new replacement photo.
                            </Text>
                        )}

                        <Flex justifyContent={"center"} gap={4} mt={5}>
                            <Button
                                w={"100%"}
                                variant="ghost"
                                onClick={() => navigate("/Shopio/superadmin/products")}
                                isDisabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                w="100%"
                                size="lg"
                                mb={6}
                                isLoading={isSubmitting}
                                loadingText={isEditMode ? "Updating..." : "Adding..."}
                                onClick={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent<HTMLFormElement>)}
                            >
                                {isEditMode ? "Update Product" : "Add Product"}
                            </Button>
                        </Flex>
                    </>
                )}
            </Box>
        </Container>
    );
}