import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Card,
  Flex,
  Text,
  Badge,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  useDisclosure,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { Search, ChevronDown } from "lucide-react";
import Table, { Column } from "../../../component/table/table";
import { order, orderRepository } from "../../../api/order";
import { useAuth } from "../../../context/AuthContext";
import Pagination from "../../../component/common/Pagination";
import { useDebounce } from "../../../hooks/debounce/debounce";

export default function OrderTable() {
  const [orders, setOrders] = useState<order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Server-driven pagination states
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isServerPaginated, setIsServerPaginated] = useState<boolean>(false);

  // Debounced search to avoid excessive API requests
  const debouncedSearch = useDebounce(searchTerm, 350);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "#0B1437");
  const cardBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.05)");
  const cardShadow = useColorModeValue(
    "0 10px 30px rgba(112, 98, 185, 0.08)",
    "0 20px 40px rgba(0, 0, 0, 0.35)"
  );
  const inputBg = useColorModeValue("#F4F7FE", "#162044");
  const inputBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.08)");
  const inputColor = useColorModeValue("gray.800", "#FFFFFF");
  const placeholderColor = useColorModeValue("gray.400", "#8FA0BD");
  const pillBg = useColorModeValue("#F4F7FE", "#162044");
  const pillColor = useColorModeValue("gray.700", "#FFFFFF");
  const menuBg = useColorModeValue("white", "#111C44");
  const menuBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.1)");
  const menuItemColor = useColorModeValue("gray.700", "#FFFFFF");
  const menuItemHover = useColorModeValue("gray.100", "rgba(255, 255, 255, 0.08)");
  const titleColor = useColorModeValue("gray.800", "#FFFFFF");
  const badgeTextColor = useColorModeValue("#0284c7", "#38bdf8");
  const badgeBg = useColorModeValue("rgba(56, 189, 248, 0.12)", "rgba(56, 189, 248, 0.15)");
  const badgeBorder = useColorModeValue("rgba(56, 189, 248, 0.3)", "rgba(56, 189, 248, 0.25)");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderRepository.getAllOrders({
        page,
        limit: pageSize,
        status: statusFilter,
        search: debouncedSearch,
      });

      if (res && res.success && Array.isArray(res.data)) {
        setOrders(res.data);
        if (res.pagination) {
          setIsServerPaginated(true);
          setTotalItems(res.pagination.total ?? 0);
          setTotalPages(res.pagination.totalPages ?? 1);
        } else {
          setIsServerPaginated(false);
          setTotalItems(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      } else if (Array.isArray(res)) {
        setIsServerPaginated(false);
        setOrders(res);
        setTotalItems(res.length);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
      } else if (res && Array.isArray(res.data)) {
        setIsServerPaginated(false);
        setOrders(res.data);
        setTotalItems(res.data.length);
        setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
      } else {
        setOrders([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders list.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 whenever search or status filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Fetch when page, pageSize, search, or status filter changes
  useEffect(() => {
    fetchOrders();
  }, [page, pageSize, debouncedSearch, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const existingOrder = orders.find((ord) => ord._id === orderId);
    if (existingOrder && existingOrder.status?.toLowerCase() === newStatus.toLowerCase()) {
      return;
    }

    try {
      setUpdatingId(orderId);
      await orderRepository.updateOrderStatus(orderId, newStatus, {
        userEmail: existingOrder?.userEmail || existingOrder?.email,
        customerName: existingOrder?.customerName || existingOrder?.userName,
      });

      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }

      toast({
        title: "Order Status Updated",
        description: `Status changed to "${newStatus}". Customer notification email dispatched.`,
        status: "success",
        duration: 3500,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update order status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleView = (row: order) => {
    setSelectedOrder(row);
    onOpen();
  };

  // Real-time filtering (fallback when server returns raw list)
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const id = (ord._id || "").toLowerCase();
      const userId = (ord.userId || "").toLowerCase();
      const payment = (ord.paymentMethod || "").toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !term || id.includes(term) || userId.includes(term) || payment.includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (ord.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // If server is paginating, use orders directly; otherwise slice client-side
  const displayOrders = useMemo(() => {
    if (isServerPaginated) {
      return orders;
    }
    return filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  }, [isServerPaginated, orders, filteredOrders, page, pageSize]);

  const currentTotalItems = isServerPaginated ? totalItems : filteredOrders.length;
  const currentTotalPages = isServerPaginated ? totalPages : Math.ceil(filteredOrders.length / pageSize) || 1;

  const columns: Column<order>[] = useMemo(
    () => [
      {
        header: "ORDER ID",
        accessor: "_id",
        render: (row) => (
          <Text fontWeight="bold" fontSize="sm" fontFamily="mono" color={titleColor}>
            #{(row._id || "").slice(-8).toUpperCase()}
          </Text>
        ),
      },
      {
        header: "CUSTOMER / USER ID",
        accessor: "userId",
        render: (row) => (
          <Box maxW="200px">
            <Text fontSize="sm" fontWeight="bold" color={titleColor} noOfLines={1} title={row.userEmail || row.email || row.userId}>
              {row.customerName || row.userName || row.userId || "Guest"}
            </Text>
            {(row.userEmail || row.email) && (
              <Text fontSize="xs" color="gray.400 || white" noOfLines={1} title={row.userEmail || row.email}>
                {row.userEmail || row.email}
              </Text>
            )}
          </Box>
        ),
      },
      {
        header: "DATE",
        accessor: "createdAt",
        render: (row) => {
          const formatted = row.createdAt
            ? new Date(row.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-";
            console.log(formatted);
              
          return <Text fontSize="sm" fontWeight="bold" color={titleColor}>{formatted}</Text>;
        },
      },
      {
        header: "AMOUNT",
        accessor: "price",
        render: (row) => (
          <Text fontWeight="bold" fontSize="sm" color={titleColor}>
            ₹{Number(row.price || 0).toLocaleString()}
          </Text>
        ),
      },
      {
        header: "PAYMENT",
        accessor: "paymentMethod",
        render: (row) => (
          <Badge
            bg={badgeBg}
            color={badgeTextColor}
            border={`1px solid ${badgeBorder}`}
            borderRadius="full"
            px={3}
            py={0.5}
            fontSize="xs"
            fontWeight="bold"
          >
            {row.paymentMethod || "Online"}
          </Badge>
        ),
      },
      {
        header: "STATUS",
        accessor: "status",
        render: (row) => {
          const st = (row.status || "Pending").toLowerCase();
          const isDelivered = st === "delivered";
          const isProcessing = st === "processing";
          const isPending = st === "pending";

          const color = isDelivered
            ? "#099964ff"
            : isProcessing
            ? "#5a0da6ff"
            : isPending
            ? "#68fb24ff"
            : "#F87171";

          return (
            <Select
              size="sm"
              value={row.status || "Pending"}
              w="125px"
             // bg={bg}
              color={color}
             // border={`1px solid ${borderColor}`}
              borderRadius="full"
              disabled={updatingId === row._id}
              onChange={(e) => handleStatusChange(row._id, e.target.value)}
              fontWeight="bold"
              fontSize="sm"
              letterSpacing="0.5px"
              cursor="pointer"
              _focus={{ bg: "#162044" }}
            >
              <option value="Pending" style={{ background: "#111C44", color: "#FBBF24" }}>Pending</option>
              <option value="Processing" style={{ background: "#111C44", color: "#C084FC" }}>Processing</option>
              <option value="Shipped" style={{ background: "#111C44", color: "#38bdf8" }}>Shipped</option>
              <option value="Delivered" style={{ background: "#111C44", color: "#34D399" }}>Delivered</option>
            </Select>
          );
        },
      },
    ],
    [updatingId]
  );

  return (
    <Box w="100%">
      <Card
        bg={cardBg}
        borderRadius={{ base: "xl", md: "2xl" }}
        boxShadow={cardShadow}
        border={`1px solid ${cardBorder}`}
        w="100%"
        p={{ base: 3, sm: 4, md: 6 }}
        transition="all 0.25s ease"
      >
        {/* Top Controls Toolbar */}
        <Flex
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          mb={6}
          flexDirection={{ base: "column", sm: "row" }}
          gap={3}
        >
          {/* Left: Search Bar & Status Filter */}
          <HStack spacing={2} flexWrap="wrap" flex="1">
            <InputGroup size="md" w={{ base: "100%", md: "240px" }}>
              <InputLeftElement pointerEvents="none">
                <Search size={16} color={placeholderColor} />
              </InputLeftElement>
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={inputBg}
                border={`1px solid ${inputBorder}`}
                borderRadius="full"
                color={inputColor}
                fontSize="sm"
                _placeholder={{ color: placeholderColor }}
                _focus={{
                  borderColor: "#38bdf8",
                  boxShadow: "0 0 0 1px #38bdf8",
                }}
              />
            </InputGroup>

            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDown size={15} />}
                bg={pillBg}
                color={pillColor}
                borderRadius="full"
                px={4}
                size="md"
                fontSize="sm"
                fontWeight="600"
                border={`1px solid ${inputBorder}`}
                _hover={{ opacity: 0.9 }}
                _active={{ opacity: 0.8 }}
              >
                {statusFilter === "all" ? "Status" : statusFilter.toUpperCase()}
              </MenuButton>
              <MenuList
                bg={menuBg}
                borderColor={menuBorder}
                boxShadow="0 10px 25px rgba(0,0,0,0.4)"
                borderRadius="xl"
                p={2}
                zIndex={10}
              >
                <MenuItem
                  bg="transparent"
                  color="#FFFFFF"
                  _hover={{ bg: "rgba(255,255,255,0.08)" }}
                  borderRadius="md"
                  onClick={() => setStatusFilter("all")}
                >
                  All Statuses
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  color="#FBBF24"
                  _hover={{ bg: "rgba(245, 158, 11, 0.15)" }}
                  borderRadius="md"
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  color="#C084FC"
                  _hover={{ bg: "rgba(168, 85, 247, 0.15)" }}
                  borderRadius="md"
                  onClick={() => setStatusFilter("processing")}
                >
                  Processing
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  color="#38bdf8"
                  _hover={{ bg: "rgba(56, 189, 248, 0.15)" }}
                  borderRadius="md"
                  onClick={() => setStatusFilter("shipped")}
                >
                  Shipped
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  color="#34D399"
                  _hover={{ bg: "rgba(16, 185, 129, 0.15)" }}
                  borderRadius="md"
                  onClick={() => setStatusFilter("delivered")}
                >
                  Delivered
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  color="#F87171"
                  _hover={{ bg: "rgba(239, 68, 68, 0.15)" }}
                  borderRadius="md"
                  onClick={() => setStatusFilter("cancelled")}
                >
                  Cancelled
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {/* Right: Total Count */}
          <Badge
            bg="#162044"
            color="#8FA0BD"
            border="1px solid rgba(255, 255, 255, 0.08)"
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
          >
            {currentTotalItems} Orders
          </Badge>
        </Flex>

        {/* Table View */}
        <Box overflowX="auto" w="100%">
          <Table<order>
            columns={columns}
            data={displayOrders}
            loading={loading}
            emptyMessage="No orders found"
            onView={handleView}
            actionsHeader="ACTIONS"
          />
        </Box>

        {/* Server-Driven Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={currentTotalPages}
          pageSize={pageSize}
          totalItems={currentTotalItems}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          isLoading={loading}
        />
      </Card>

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(6px)" bg="rgba(0, 0, 0, 0.6)" />
        <ModalContent bg="#111C44" color="#FFFFFF" borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.1)">
          <ModalHeader>
            <HStack justify="space-between" pr={6}>
              <Text fontSize="lg" fontWeight="bold">Order Details</Text>
              <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5}>
                #{(selectedOrder?._id || "").slice(-8).toUpperCase()}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <Divider borderColor="rgba(255, 255, 255, 0.1)" />
          <ModalBody py={5}>
            {selectedOrder && (
              <Box fontSize="sm">
                <Flex justify="space-between" py={2}>
                  <Text color="#8FA0BD">Full Order ID:</Text>
                  <Text fontWeight="mono" fontSize="xs">{selectedOrder._id}</Text>
                </Flex>
                <Flex justify="space-between" py={2}>
                  <Text color="#8FA0BD">Customer / User ID:</Text>
                  <Text fontWeight="600">{selectedOrder.userId || "Guest"}</Text>
                </Flex>
                {(selectedOrder.customerName || selectedOrder.userName) && (
                  <Flex justify="space-between" py={2}>
                    <Text color="#8FA0BD">Customer Name:</Text>
                    <Text fontWeight="600">{selectedOrder.customerName || selectedOrder.userName}</Text>
                  </Flex>
                )}
                <Flex justify="space-between" py={2}>
                  <Text color="#8FA0BD">Customer Email:</Text>
                  <Text fontWeight="600" color="#38bdf8">
                    {selectedOrder.userEmail || selectedOrder.email || "Registered User"}
                  </Text>
                </Flex>
                <Flex justify="space-between" py={2}>
                  <Text color="#8FA0BD">Order Date:</Text>
                  <Text>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "-"}</Text>
                </Flex>
                <Flex justify="space-between" py={2}>
                  <Text color="#8FA0BD">Payment Method:</Text>
                  <Text fontWeight="600">{selectedOrder.paymentMethod || "Online"}</Text>
                </Flex>
                <Flex justify="space-between" py={2}>
                  <Text color="#8FA0BD">Shipping:</Text>
                  <Text>{selectedOrder.shipping || "Standard Delivery"}</Text>
                </Flex>
                <Flex justify="space-between" py={2}>
                  <Text color="#8FA0BD">Current Status:</Text>
                  <Badge colorScheme="green" borderRadius="full" px={2.5}>
                    {selectedOrder.status || "Pending"}
                  </Badge>
                </Flex>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                  <Box mt={3} pt={2} borderTop="1px solid rgba(255, 255, 255, 0.08)">
                    <Text color="#8FA0BD" fontSize="xs" fontWeight="bold" textTransform="uppercase" mb={2}>
                      Items in Order ({selectedOrder.items.length})
                    </Text>
                    <Box maxH="130px" overflowY="auto" pr={1}>
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <Flex key={idx} justify="space-between" py={1} fontSize="xs" borderBottom="1px dashed rgba(255, 255, 255, 0.06)">
                          <Text noOfLines={1} maxW="260px" color="gray.200">
                            {item.title || item.name || `Item #${idx + 1}`} (x{item.quantity || 1})
                          </Text>
                          <Text fontWeight="600" color="gray.300">
                            ₹{Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </Text>
                        </Flex>
                      ))}
                    </Box>
                  </Box>
                )}
                <Divider my={3} borderColor="rgba(255, 255, 255, 0.1)" />
                <Flex justify="space-between" py={2} fontSize="md">
                  <Text fontWeight="bold">Total Amount:</Text>
                  <Text fontWeight="bold" color="#38bdf8">
                    ₹{Number(selectedOrder.price || 0).toLocaleString()}
                  </Text>
                </Flex>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              bg="#8BE3F8"
              color="#0B1437"
              borderRadius="full"
              fontWeight="bold"
              _hover={{ bg: "#60d3ee" }}
              onClick={onClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
