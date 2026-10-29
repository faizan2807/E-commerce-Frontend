import axiosInstance from "./axiosinstance";

export interface order {
    _id: string;
    userId: string;
    productId?: string;
    paymentMethod?: string;
    status?: string;
    price?: number;
    date?: string;
    createdAt:string;
    shipping?: string;
    userEmail?: string;
    email?: string;
    customerName?: string;
    userName?: string;
    items?: any[];
    notes?: string;
    [key: string]: any;
}

export type Order = order;

export interface OrderPaginationParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    [key: string]: any;
}

export interface PaginatedOrdersResponse {
    success?: boolean;
    data: order[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage?: boolean;
        hasPrevPage?: boolean;
    };
    total?: number;
    totalPages?: number;
    page?: number;
    limit?: number;
}

export const orderRepository = {
    
    getOrderByUserId: async (userId: string, orderId?: string): Promise<order[] | order | any> => {
        const url = orderId ? `/api/order/${userId}/${orderId}` : `/api/order/${userId}`;
        const { data } = await axiosInstance.get(url);
        return data;
    },

    postOrderByUserId: async (userId: string, payload: Partial<order> | any): Promise<order> => {
        const { data } = await axiosInstance.post<order>(`/api/order/${userId}`, payload);
        return data;
    },

    putOrderByUserId: async (
        userId: string,
        orderId: string,
        payload: Partial<order> | any
    ): Promise<order> => {
        const { data } = await axiosInstance.put<order>(`/api/order/${userId}/${orderId}`, payload);
        return data;
    },
    patchOrderByUserId: async (
        userId: string,
        orderId: string,
        payload: Partial<order> | any
    ): Promise<order> => {
        const { data } = await axiosInstance.patch<order>(`/api/order/${userId}/${orderId}`, payload);
        return data;
    },
    deleteOrderByUserId: async (userId: string, orderId: string): Promise<void> => {
        await axiosInstance.delete(`/api/order/${userId}/${orderId}`);
    },

    cancelOrder: async (userId: string, orderId: string, reason?: string): Promise<order> => {
        try {
            const { data } = await axiosInstance.put<order>(`/api/order/${userId}/cancel/${orderId}`, {
                reason,
                status: "Cancelled",
            });
            return data;
        } catch {
            const { data } = await axiosInstance.patch<order>(`/api/order/${userId}/${orderId}`, {
                status: "Cancelled",
                cancelReason: reason,
            });
            return data;
        }
    },

    getAllOrders: async (params?: OrderPaginationParams): Promise<PaginatedOrdersResponse | order[] | any> => {
        const queryParams = params
            ? {
                page: params.page,
                limit: params.limit,
                status: params.status && params.status !== "all" ? params.status : undefined,
                search: params.search ? params.search.trim() : undefined,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            }
            : undefined;

        try {
            const { data } = await axiosInstance.get("/api/order", { params: queryParams });
            // If caller didn't pass pagination params (e.g. legacy or dashboard), return array directly
            if (!params) {
                if (Array.isArray(data)) return data;
                if (data && Array.isArray(data.data)) return data.data;
            }
            return data;
        } catch {
            try {
                const { data } = await axiosInstance.get("/api/orders", { params: queryParams });
                if (!params) {
                    if (Array.isArray(data)) return data;
                    if (data && Array.isArray(data.data)) return data.data;
                }
                return data;
            } catch (err) {
                console.error("Failed to fetch all orders:", err);
                return params ? { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } } : [];
            }
        }
    },

    // UPDATE order status by admin and notify user
    updateOrderStatus: async (
        orderId: string,
        status: string,
        metadata?: { userEmail?: string; customerName?: string; [key: string]: any }
    ): Promise<order> => {
        const payload = { status, ...metadata };
        try {
            const { data } = await axiosInstance.put<order>(`/api/order/status/${orderId}`, payload);
            return data;
        } catch {
            const { data } = await axiosInstance.patch<order>(`/api/order/${orderId}`, payload);
            return data;
        }
    },
};