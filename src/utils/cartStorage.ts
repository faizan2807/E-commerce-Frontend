export interface LocalCartItem {
    id: string;
    productId?: string;
    title: string;
    price: number;
    image: string;
    images?: string[];
    quantity: number;
    category?: string;
    brand?: string;
    description?: string;
}

const CART_STORAGE_KEY = "cart";

export const dispatchCartUpdate = (): void => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("cart-updated"));
    }
};

export const getLocalCart = (): LocalCartItem[] => {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((item) => item && (item.id || item.productId))
            .map((item) => {
                const id = String(item.id || item.productId);
                const rawImg = item.image || (Array.isArray(item.images) ? item.images[0] : "");
                const imageStr = typeof rawImg === "string" ? rawImg : Array.isArray(rawImg) ? rawImg[0] || "" : "";
                const imgArr = Array.isArray(item.images)
                    ? item.images
                    : Array.isArray(item.image)
                    ? item.image
                    : imageStr
                    ? [imageStr]
                    : [];

                return {
                    id,
                    productId: id,
                    title: item.title || "Product",
                    price: Number(item.price) || 0,
                    image: imageStr,
                    images: imgArr,
                    quantity: Math.max(1, Number(item.quantity) || 1),
                    category: item.category || "",
                    brand: item.brand || "",
                    description: item.description || "",
                };
            });
    } catch (err) {
        console.error("Failed to read local cart from storage:", err);
        return [];
    }
};

export const setLocalCart = (items: LocalCartItem[]): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        dispatchCartUpdate();
    } catch (err) {
        console.error("Failed to write local cart to storage:", err);
    }
};

export const addToLocalCart = (
    item: Omit<LocalCartItem, "quantity"> & { quantity?: number }
): { isNew: boolean; currentQuantity: number } => {
    const cart = getLocalCart();
    const pid = String(item.id || item.productId);
    const existingIndex = cart.findIndex((i) => i.id === pid || i.productId === pid);
    const addQty = Math.max(1, Number(item.quantity) || 1);

    const imageStr = typeof item.image === "string" ? item.image : Array.isArray(item.image) ? item.image[0] || "" : "";
    const imgArr = Array.isArray(item.images)
        ? item.images
        : Array.isArray(item.image)
        ? item.image
        : imageStr
        ? [imageStr]
        : [];

    if (existingIndex > -1) {
        cart[existingIndex].quantity += addQty;
        // Optionally update other metadata if not present
        if (!cart[existingIndex].image && imageStr) cart[existingIndex].image = imageStr;
        if (!cart[existingIndex].images?.length && imgArr.length) cart[existingIndex].images = imgArr;
        setLocalCart(cart);
        return { isNew: false, currentQuantity: cart[existingIndex].quantity };
    } else {
        const newItem: LocalCartItem = {
            id: pid,
            productId: pid,
            title: item.title,
            price: Number(item.price) || 0,
            image: imageStr,
            images: imgArr,
            quantity: addQty,
            category: item.category,
            brand: item.brand,
            description: item.description,
        };
        cart.push(newItem);
        setLocalCart(cart);
        return { isNew: true, currentQuantity: addQty };
    }
};

export const updateLocalCartQuantity = (productId: string, quantity: number): LocalCartItem[] => {
    const pid = String(productId);
    const cart = getLocalCart();
    let updated: LocalCartItem[];

    if (quantity <= 0) {
        updated = cart.filter((i) => i.id !== pid && i.productId !== pid);
    } else {
        updated = cart.map((i) => {
            if (i.id === pid || i.productId === pid) {
                return { ...i, quantity };
            }
            return i;
        });
    }

    setLocalCart(updated);
    return updated;
};

export const removeFromLocalCart = (productId: string): LocalCartItem[] => {
    const pid = String(productId);
    const cart = getLocalCart();
    const updated = cart.filter((i) => i.id !== pid && i.productId !== pid);
    setLocalCart(updated);
    return updated;
};

export const clearLocalCart = (): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        dispatchCartUpdate();
    } catch (err) {
        console.error("Failed to clear local cart:", err);
    }
};

export const getLocalCartCount = (): number => {
    const cart = getLocalCart();
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
};
