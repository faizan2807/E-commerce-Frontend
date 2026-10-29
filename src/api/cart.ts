import axiosInstance from "./axiosinstance";

export interface CartItem {
    _id: string;
    userId: string;
    productId: string;
    title: string;
    description?: string;
    price: number;
    quantity: number;
    category?: string;
    image?: string[];
    brand?: string;
}


export interface CartResponse {
    success: boolean;
    message?: string;
    count: number;
    cart: CartItem[];
}

export interface CartActionResponse {
    success: boolean;
    message: string;
    item?: CartItem;
}

export interface SyncCartItem {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    category?: string;
    image?: string[] | string;
    brand?: string;
    description?: string;
}

export const cartApi = {
    // 1. Get user's cart items -> GET /api/cart
    getCart: async (userId?: string) => {
        const url = userId ? `/api/cart/${userId}` : "/api/cart";
        const res = await axiosInstance.get<CartResponse>(url);
        return res.data;
    },

    // 2. Get cart count for navbar badge -> GET /api/cart/count
    getCartCount: async (userId?: string) => {
        const url = userId ? `/api/cart/count/${userId}` : "/api/cart/count";
        const res = await axiosInstance.get<{ success: boolean; count: number }>(url);
        return res.data.count;
    },

    // 3. Add item to cart -> POST /api/cart/add
    addToCart: async (
        productId: string,
        quantity: number = 1,
        extraData?: Partial<Omit<CartItem, "_id" | "userId">>
    ) => {
        const res = await axiosInstance.post<CartActionResponse>("/api/cart/add", {
            productId,
            quantity,
            ...extraData,
        });
        return res.data;
    },

    // 4. Update item quantity (+ or -) -> PUT /api/cart/update/:productId
    updateQuantity: async (productId: string, quantity: number) => {
        const res = await axiosInstance.put<CartActionResponse>(
            `/api/cart/update/${productId}`,
            { quantity }
        );
        return res.data;
    },

    // 5. Remove specific item -> DELETE /api/cart/remove/:productId
    removeFromCart: async (productId: string) => {
        const res = await axiosInstance.delete<{ success: boolean; message: string }>(
            `/api/cart/remove/${productId}`
        );
        return res.data;
    },

    // 6. Clear whole cart (after checkout or reset) -> DELETE /api/cart/clear
    clearCart: async (userId?: string) => {
        const url = userId ? `/api/cart/clear/${userId}` : "/api/cart/clear";
        const res = await axiosInstance.delete<{ success: boolean; message: string }>(url);
        return res.data;
    },

    // 7. Sync/merge guest cart items into user's database cart upon login
    syncGuestCart: async (items: SyncCartItem[]) => {
        if (!items || items.length === 0) return { success: true, count: 0, cart: [] };

        // Attempt bulk merge if backend endpoint /api/cart/merge exists
        try {
            const res = await axiosInstance.post<CartResponse>("/api/cart/merge", { items });
            return res.data;
        } catch (err: any) {
            // Graceful fallback to standard endpoints if bulk /api/cart/merge is not available
            try {
                let existingCart: CartItem[] = [];
                try {
                    const cartData = await cartApi.getCart();
                    existingCart = cartData.cart || [];
                } catch {
                    existingCart = [];
                }

                for (const item of items) {
                    const pid = item.productId;
                    if (!pid) continue;

                    const existingItem = existingCart.find(
                        (c) => (c.productId || c._id) === pid
                    );

                    const imgArr = Array.isArray(item.image)
                        ? item.image
                        : item.image
                        ? [item.image]
                        : [];

                    if (existingItem) {
                        const newQuantity = (existingItem.quantity || 1) + (item.quantity || 1);
                        try {
                            await cartApi.updateQuantity(pid, newQuantity);
                        } catch {
                            await cartApi.addToCart(pid, item.quantity || 1, {
                                title: item.title,
                                price: item.price,
                                category: item.category,
                                image: imgArr,
                                brand: item.brand,
                                description: item.description,
                            });
                        }
                    } else {
                        await cartApi.addToCart(pid, item.quantity || 1, {
                            title: item.title,
                            price: item.price,
                            category: item.category,
                            image: imgArr,
                            brand: item.brand,
                            description: item.description,
                        });
                    }
                }
                return await cartApi.getCart();
            } catch (fallbackErr) {
                console.warn("Fallback cart sync encountered error:", fallbackErr);
                return { success: false, count: 0, cart: [] };
            }
        }
    },
};

