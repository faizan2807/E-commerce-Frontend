import { useEffect, useState } from "react";
import {

  Box,
  Image,
  SimpleGrid,
  Text,
  VStack,
  IconButton,
  Tooltip,
  Spinner,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { Star, Heart } from "lucide-react";
import {
  productRepository,
  ProductsTableData,
} from "../../../api/product";
import { useNavigate } from "react-router-dom";
import { getProductImageUrl } from "../../../utils/imageUtils";
import { useAuth } from "../../../context/AuthContext";
import { useCenterAlert } from "../../../context/AlertContext";
import { cartApi } from "../../../api/cart";
import { addToLocalCart, dispatchCartUpdate } from "../../../utils/cartStorage";
import { toggleLocalFavourite, getLocalFavouriteIds } from "../../../utils/favouriteStorage";

export default function Products() {
  const { token, userId } = useAuth();
  const { showAlert } = useCenterAlert();
  const [products, setProducts] = useState<ProductsTableData[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const stageBg = useColorModeValue("radial-gradient(ellipse at center, #ffffff 0%, #f8fafc 100%)", "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)");
  const titleColor = useColorModeValue("gray.900", "gray.100");
  const ratingTextColor = useColorModeValue("#b45309", "#fbbf24");
  const detailsBg = useColorModeValue("white", "gray.800");

  const getProducts = async () => {
    try {
      setLoading(true);

      const response = await productRepository.getAllProduct();

      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();

    const syncFavIds = () => {
      if (token) {
        productRepository.getFavouriteProducts(userId || undefined)
          .then((res) => {
            if (res && res.data && Array.isArray(res.data)) {
              const ids = new Set(res.data.map((p) => p._id || p.id));
              setFavouriteIds(ids);
            }
          })
          .catch(() => { });
      } else {
        setFavouriteIds(getLocalFavouriteIds());
      }
    };

    syncFavIds();
    window.addEventListener("favourite-updated", syncFavIds);
    return () => {
      window.removeEventListener("favourite-updated", syncFavIds);
    };
  }, [token, userId]);

  const handleToggleFavourite = async (
    e: React.MouseEvent,
    productId: string,
    title: string,
    productItem?: ProductsTableData
  ) => {
    e.stopPropagation();

    if (!token) {
      const targetProduct = productItem || products.find((p) => (p._id || p.id) === productId);
      if (!targetProduct) return;

      const { isFavourite } = toggleLocalFavourite(targetProduct);
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (isFavourite) next.add(productId);
        else next.delete(productId);
        return next;
      });

      showAlert({
        title: isFavourite ? "Added to Wishlist!" : "Removed from Wishlist",
        description: isFavourite
          ? `${title} was added to your favourites.`
          : `${title} was removed from your favourites.`,
        status: isFavourite ? "success" : "info",
        duration: 2000,
      });
      return;
    }

    try {
      setActionLoadingId(productId);
      await productRepository.postFavouriteProductsByUserId(productId, userId || undefined);
      const isFav = favouriteIds.has(productId);

      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      window.dispatchEvent(new Event("favourite-updated"));

      showAlert({
        title: !isFav ? "Added to Wishlist!" : "Removed from Wishlist",
        description: !isFav
          ? `${title} was added to your favourites.`
          : `${title} was removed from your favourites.`,
        status: !isFav ? "success" : "info",
        duration: 2000,
      });
    } catch (err: any) {
      showAlert({
        title: "Action Failed",
        description: err.response?.data?.message || "Could not update favourite status.",
        status: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddToCart = async (product: ProductsTableData) => {
    const productIdVal = product._id || product.id;
    const imgArr = Array.isArray(product.image)
      ? product.image
      : product.image
        ? [product.image]
        : [];
    const mainImg = imgArr[0] || "";

    try {
      if (token) {
        await cartApi.addToCart(productIdVal, 1, {
          title: product.title,
          price: product.price,
          category: product.category,
          image: imgArr,
          brand: product.brand,
        });
      } else {
        addToLocalCart({
          id: productIdVal,
          productId: productIdVal,
          title: product.title,
          price: product.price,
          image: mainImg,
          images: imgArr,
          quantity: 1,
          category: product.category,
          brand: product.brand,
        });
      }

      dispatchCartUpdate();

      showAlert({
        title: "Added to Cart!",
        description: `${product.title} has been added to your cart.`,
        status: "success",
        duration: 2000,
      });
    } catch (err: any) {
      showAlert({
        title: "Failed to Add to Cart",
        description: err.response?.data?.message || err.message,
        status: "error",
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="240px">
        <Spinner size="lg" color="red.500" />
      </Flex>
    );
  }

  return (
    <Box w="100%" bg={cardBg}>
      {products.length === 0 ? (
        <Box textAlign="center" py={10} bg="gray.50" borderRadius="xl">
          <Text fontWeight="bold" color="gray.700">
            No products found.
          </Text>
        </Box>
      ) : (
        <SimpleGrid
          columns={{
            base: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5,
          }}
          spacing={{ base: 4, md: 5 }}
        >
          {products.map((product) => {
            const pid = product._id || product.id;
            const isFav = favouriteIds.has(pid);
            return (
              <Box
                key={pid}
                borderWidth="1px"
                borderColor={cardBorder}
                minH="250px"
                w="100%"
                borderRadius="2xl"
                overflow="hidden"
                bg={cardBg}
                boxShadow="0 4px 18px -2px rgba(0, 0, 0, 0.05)"
                transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                position="relative"
                display="flex"
                flexDirection="column"
                role="group"
                _hover={{
                  transform: "translateY(-6px)",
                  boxShadow: "0 22px 35px -8px rgba(0, 0, 0, 0.18), 0 8px 16px -4px rgba(229, 62, 62, 0.1)",
                  borderColor: "red.300",
                }}
              >
                {/* Wishlist Floating Pill Button */}
                <Tooltip label={isFav ? "Remove from Wishlist" : "Add to Wishlist"} hasArrow>
                  <IconButton
                    aria-label="Wishlist"
                    icon={
                      <Heart
                        size={15}
                        fill={isFav ? "#ef4444" : "transparent"}
                        color={isFav ? "#ef4444" : "#64748b"}
                      />
                    }
                    size="sm"
                    variant="solid"
                    bg="whiteAlpha.900"
                    backdropFilter="blur(8px)"
                    boxShadow="0 4px 12px rgba(0,0,0,0.08)"
                    border="1px solid"
                    borderColor="whiteAlpha.600"
                    borderRadius="full"
                    position="absolute"
                    top={3}
                    right={3}
                    zIndex={3}
                    isLoading={actionLoadingId === pid}
                    _hover={{ bg: "red.50", transform: "scale(1.15)" }}
                    onClick={(e) => handleToggleFavourite(e, pid, product.title, product)}
                  />
                </Tooltip>

                {/* Studio Product Image Stage */}
                <Box
                  w="100%"
                  aspectRatio="1 / 1"
                  maxW="800px"
                  maxH="800px"
                  bg={stageBg}
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  position="relative"
                  overflow="hidden"
                  onClick={() => navigate(`/Shopio/productDetails/${pid}`)}
                >
                  <Image
                    src={getProductImageUrl(product.image)}
                    alt={product.title}
                    w="100%"
                    h="100%"
                    maxW="100%"
                    maxH="100%"
                    objectFit="contain"
                    transition="transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
                    _groupHover={{ transform: "scale(1.08)" }}
                    fallbackSrc="https://via.placeholder.com/800x800?text=No+Image"
                  />
                  <Box position="absolute" top="4" right="4">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <Text fontSize="xs" fontWeight="bold" color={ratingTextColor}>
                      {product.rating?.rate ?? 0}
                    </Text>
                  </Box>

                </Box>

                {/* Product Details Section */}
                <VStack
                  align="stretch"
                  spacing={2.5}
                  p={4}
                  flex="1"
                  bg={detailsBg}
                >
                  {/* Product Title with smooth hover highlight */}
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={titleColor}
                    noOfLines={2}
                    lineHeight="1.4"
                    cursor="pointer"
                    transition="color 0.2s"
                    textAlign={"center"}
                    _groupHover={{ color: "red.400" }}
                    onClick={() => navigate(`/Shopio/productDetails/${pid}`)}
                  >
                    {product.title}
                  </Text>

                  {/* <Button
                      bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                      color="white"
                      size="sm"
                      borderRadius="xl"
                      flex="1"
                      leftIcon={<ShoppingBag size={14} />}
                      boxShadow="0 2px 8px rgba(229, 62, 62, 0.25)"
                      transition="all 0.25s ease"
                      _hover={{
                        bg: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                        boxShadow: "0 6px 16px -2px rgba(229, 62, 62, 0.4)",
                        transform: "translateY(-1px)",
                      }}
                      _active={{ transform: "translateY(0)" }}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button> */}
                  {/* <Button
                    colorScheme="blue"
                    bg={"red.300"}
                    size="sm"
                    borderRadius="xl"
                    px={3}
                    justifyContent={"center"}
                    alignItems={"center"}
                    borderColor={outlineBtnBorder}
                    color={titleColor}
                    _hover={{ bg: outlineBtnHoverBg }}
                    onClick={() => navigate(`/Shopio/productDetails/${pid}`)}
                  >
                    View
                  </Button> */}

                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}