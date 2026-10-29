import axiosInstance from "./axiosinstance";

export interface CreatePaymentOrderResponse {
    success: boolean;
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    message?: string;
    rawOrder?: any;
}

export interface VerifyPaymentPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderData: {
        productId?: string;
        price: number;
        shipping?: string;
        paymentMethod?: string;
        items?: any[];
    };
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    orderId?: string;
    order?: any;
    data?: any;
}

export const paymentApi = {
    // 0. Fetch Razorpay Public Key from backend -> GET /api/payment/key
    getRazorpayKey: async (): Promise<string> => {
        try {
            const res = await axiosInstance.get<{ success: boolean; key?: string }>("/api/payment/key");
            if (res.data && res.data.key) {
                return res.data.key;
            }
        } catch (err) {
            console.warn("Could not fetch Razorpay key from backend /api/payment/key:", err);
        }
        return import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";
    },

    // 1. Create Razorpay Order on Backend -> POST /api/payment/create-order
    createPaymentOrder: async (
        amount: number,
        currency: string = "INR",
        productId?: string
    ): Promise<CreatePaymentOrderResponse> => {
        const keyId = await paymentApi.getRazorpayKey();
        try {
            const res = await axiosInstance.post<any>("/api/payment/create-order", {
                amount,
                currency,
                productId,
            });

            if (res.data?.success === false) {
                return {
                    success: false,
                    message: res.data?.message || "Failed to initiate Razorpay order",
                };
            }

            // Harmonize response whether backend wraps inside `data` or returns directly
            const orderData = res.data?.data || res.data?.order || res.data;
            const orderId = orderData?.id || orderData?.orderId || res.data?.orderId;
            const orderAmount = orderData?.amount || res.data?.amount || Math.round(amount * 100);
            const orderCurrency = orderData?.currency || res.data?.currency || currency;

            if (orderId) {
                return {
                    success: true,
                    orderId,
                    amount: orderAmount,
                    currency: orderCurrency,
                    keyId,
                    rawOrder: orderData,
                };
            }

            return {
                success: false,
                message: res.data?.message || "Order ID was not returned by the payment server",
            };
        } catch (err: any) {
            const serverMessage =
                err.response?.data?.message ||
                err.response?.data?.error?.description ||
                err.message ||
                "Failed to initiate Razorpay order on server";
            console.error("Backend /api/payment/create-order error:", serverMessage);
            return {
                success: false,
                message: serverMessage,
            };
        }
    },

    // 2. Verify signature & create order on Backend -> POST /api/payment/verify
    verifyPayment: async (payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
        try {
            const res = await axiosInstance.post<VerifyPaymentResponse>("/api/payment/verify", payload);
            return res.data;
        } catch (err: any) {
            console.warn("Backend /api/payment/verify failed, returning graceful error response:", err);
            return {
                success: false,
                message: err.response?.data?.message || "Payment verification failed. Please try again.",
            };
        }
    },
};
