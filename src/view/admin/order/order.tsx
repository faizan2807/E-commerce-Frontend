import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Text,
    VStack,
    Badge,
    Spinner,
    Divider,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Select,
    FormControl,
    FormLabel,
    useDisclosure,
    useColorModeValue,
} from "@chakra-ui/react";
import { ArrowLeft, PackageCheck, ShoppingBag, XCircle, AlertTriangle, CreditCard, Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { order, orderRepository } from "../../../api/order";
import { useAuth } from "../../../context/AuthContext";
import { useCenterAlert } from "../../../context/AlertContext";

export default function Order() {
    const navigate = useNavigate();
    const { userId, email, user } = useAuth();
    const { showAlert } = useCenterAlert();
    const [orders, setOrders] = useState<order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<order | null>(null);
    const [cancelReason, setCancelReason] = useState<string>("Changed my mind");
    const [isCancelling, setIsCancelling] = useState(false);

    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.900", "white");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subTextColor = useColorModeValue("gray.500", "gray.400");
    const modalBg = useColorModeValue("white", "gray.800");
    const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            if (userId) {
                const res = await orderRepository.getOrderByUserId(userId);
                if (res && Array.isArray(res)) {
                    setOrders(res);
                } else if (res && (res as any).data) {
                    setOrders(Array.isArray((res as any).data) ? (res as any).data : [res]);
                }
            }
        } catch (err) {
            console.error("Failed to load orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    const handleConfirmCancel = async () => {
        if (!selectedOrderToCancel || !userId) return;
        setIsCancelling(true);
        try {
            await orderRepository.cancelOrder(userId, selectedOrderToCancel._id, cancelReason);

            // Update local state immediately
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === selectedOrderToCancel._id
                        ? { ...o, status: "Cancelled", cancelReason }
                        : o
                )
            );

            onCancelClose();

            showAlert({
                title: "Order Cancelled",
                description: `Order #${selectedOrderToCancel._id.slice(-8).toUpperCase()} has been cancelled. A cancellation confirmation email has been sent to ${email || user?.email || "your registered email"}.`,
                status: "info",
                duration: 4000,
            });
        } catch (err: any) {
            console.error("Failed to cancel order:", err);
            showAlert({
                title: "Cancellation Failed",
                description: err.response?.data?.message || "Could not cancel order. Please try again or contact support.",
                status: "error",
            });
        } finally {
            setIsCancelling(false);
            setSelectedOrderToCancel(null);
        }
    };

    return (
        <Container maxW="1480px" px={{ base: 4, md: 8 }} py={8}>
            <HStack mb={6} spacing={3}>
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft size={16} />}
                    onClick={() => navigate("/Shopio")}
                    colorScheme="red"
                >
                    Back to Home
                </Button>
            </HStack>

            <Flex align="center" justify="space-between" mb={6} wrap="wrap" gap={3}>
                <Box>
                    <Heading size="lg" color="gray.800" fontWeight="bold">
                        My Orders
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                        Track, manage, and view your orders, shipments, and invoices
                    </Text>
                </Box>
            </Flex>

            {loading ? (
                <Flex justify="center" align="center" minH="300px">
                    <Spinner size="xl" color="red.500" />
                </Flex>
            ) : orders.length === 0 ? (
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={{ base: 8, md: 16 }}
                    textAlign="center"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor={cardBorder}
                >
                    <VStack spacing={4} maxW="400px" mx="auto">
                        <Box
                            p={5}
                            bg="red.50"
                            color="red.500"
                            borderRadius="full"
                            display="inline-flex"
                        >
                            <ShoppingBag size={48} />
                        </Box>
                        <Heading size="md" color="gray.800">
                            No orders found
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                            You haven't placed any orders yet. Once you place an order, you can track its delivery status here.
                        </Text>
                        <Button
                            size="md"
                            borderRadius="xl"
                            px={8}
                            h="46px"
                            fontWeight="700"
                            bgGradient="linear(135deg, #e53e3e 0%, #c53030 100%)"
                            color="white"
                            boxShadow="0 10px 20px -5px rgba(229, 62, 62, 0.4)"
                            _hover={{
                                bgGradient: "linear(135deg, #c53030 0%, #9b2c2c 100%)",
                                transform: "translateY(-2px)",
                            }}
                            mt={2}
                            onClick={() => navigate("/Shopio")}
                        >
                            Start Shopping
                        </Button>
                    </VStack>
                </Box>
            ) : (
                <VStack spacing={4} align="stretch">
                    {orders.map((ord) => {
                        const isCancelled = ord.status === "Cancelled";
                        const isDelivered = ord.status === "Delivered";
                        const canCancel = !isCancelled && !isDelivered;

                        return (
                            <Box
                                key={ord._id}
                                bg={cardBg}
                                p={{ base: 5, sm: 6 }}
                                borderRadius="2xl"
                                border="1px solid"
                                borderColor={isCancelled ? "red.800" : cardBorder}
                                boxShadow="0 4px 20px -5px rgba(0, 0, 0, 0.05)"
                                transition="all 0.2s ease"
                                _hover={{
                                    borderColor: isCancelled ? "red.400" : "red.300",
                                    boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.12)",
                                }}
                            >
                                <Flex
                                    justify="space-between"
                                    align={{ base: "start", sm: "center" }}
                                    direction={{ base: "column", sm: "row" }}
                                    gap={3}
                                >
                                    <HStack spacing={3.5}>
                                        <Box
                                            p={3}
                                            bg={isCancelled ? "red.50" : isDelivered ? "emerald.50" : "blue.50"}
                                            color={isCancelled ? "red.600" : isDelivered ? "green.600" : "blue.600"}
                                            borderRadius="xl"
                                            border="1px solid"
                                            borderColor={isCancelled ? "red.100" : isDelivered ? "green.100" : "blue.100"}
                                        >
                                            {isCancelled ? <XCircle size={22} /> : <PackageCheck size={22} />}
                                        </Box>
                                        <Box>
                                            <HStack spacing={2}>
                                                <Text fontWeight="800" fontSize="sm" color={textColor}>
                                                    Order #{ord._id.slice(-8).toUpperCase()}
                                                </Text>
                                                {ord.paymentMethod && (
                                                    <Badge
                                                        variant="subtle"
                                                        colorScheme={ord.paymentMethod.includes("Online") ? "purple" : "gray"}
                                                        fontSize="2xs"
                                                        borderRadius="full"
                                                        px={2.5}
                                                        py={0.5}
                                                        fontWeight="700"
                                                    >
                                                        {ord.paymentMethod}
                                                    </Badge>
                                                )}
                                            </HStack>
                                            <Text fontSize="xs" color="gray.500" mt={0.5}>
                                                Placed on {ord.date || "Recent"} • {ord.shipping || "Standard Delivery"}
                                                {ord.paymentRef && (
                                                    <Text as="span" color="purple.600" ml={1} fontWeight="semibold">
                                                        • Ref: {ord.paymentRef}
                                                    </Text>
                                                )}
                                            </Text>
                                        </Box>
                                    </HStack>

                                    <HStack
                                        spacing={4}
                                        justify={{ base: "space-between", sm: "flex-end" }}
                                        w={{ base: "100%", sm: "auto" }}
                                    >
                                        <Badge
                                            colorScheme={
                                                isDelivered
                                                    ? "green"
                                                    : ord.status === "Shipped"
                                                        ? "blue"
                                                        : isCancelled
                                                            ? "red"
                                                            : "orange"
                                            }
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                        >
                                            {ord.status || "Processing"}
                                        </Badge>

                                        <Text fontWeight="900" fontSize="lg" bgGradient="linear(to-r, red.600, red.500)" bgClip="text">
                                            ₹{Number(ord.price).toLocaleString("en-IN")}
                                        </Text>

                                        {canCancel && (
                                            <Button
                                                variant="outline"
                                                colorScheme="red"
                                                size="sm"
                                                borderRadius="xl"
                                                leftIcon={<XCircle size={14} />}
                                                onClick={() => {
                                                    setSelectedOrderToCancel(ord);
                                                    onCancelOpen();
                                                }}
                                            >
                                                Cancel Order
                                            </Button>
                                        )}
                                    </HStack>
                                </Flex>

                                {isCancelled && ord.cancelReason && (
                                    <Box mt={3} pt={3} borderTop="1px dashed" borderColor="red.100">
                                        <Text fontSize="xs" color="red.600">
                                            <b>Cancellation Reason:</b> {ord.cancelReason}
                                        </Text>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </VStack>
            )}

            {/* Cancel Order Confirmation Modal */}
            <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
                <ModalContent borderRadius="2xl" bg={modalBg}>
                    <ModalHeader pb={2}>
                        <HStack spacing={2} color="red.600">
                            <AlertTriangle size={20} />
                            <Text fontSize="md" fontWeight="bold">
                                Cancel Order #{selectedOrderToCancel?._id.slice(-8).toUpperCase()}
                            </Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody py={4}>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="gray.600">
                                Are you sure you want to cancel this order? An email notification confirming the cancellation will be sent to <b>{email || user?.email || "your email"}</b>.
                            </Text>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">
                                    Reason for cancellation
                                </FormLabel>
                                <Select
                                    size="sm"
                                    borderRadius="lg"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                >
                                    <option value="Changed my mind">Changed my mind</option>
                                    <option value="Ordered by mistake">Ordered by mistake</option>
                                    <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                                    <option value="Delivery time is too long">Delivery time is too long</option>
                                    <option value="Other reason">Other reason</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter pt={2}>
                        <Button variant="ghost" mr={3} onClick={onCancelClose} isDisabled={isCancelling}>
                            Keep Order
                        </Button>
                        <Button
                            colorScheme="red"
                            isLoading={isCancelling}
                            loadingText="Cancelling Order..."
                            onClick={handleConfirmCancel}
                        >
                            Confirm Cancellation
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}