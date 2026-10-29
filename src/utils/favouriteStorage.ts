import { ProductsTableData } from "../api/product";

const FAVOURITE_STORAGE_KEY = "guest_favourites";

export const dispatchFavouriteUpdate = (): void => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("favourite-updated"));
    }
};

export const getLocalFavourites = (): ProductsTableData[] => {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(FAVOURITE_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((item) => item && (item._id || item.id));
    } catch (err) {
        console.error("Failed to read local favourites from storage:", err);
        return [];
    }
};

export const getLocalFavouriteIds = (): Set<string> => {
    const list = getLocalFavourites();
    return new Set(list.map((item) => String(item._id || item.id)));
};

export const isLocalFavourite = (productId: string): boolean => {
    const pid = String(productId);
    const list = getLocalFavourites();
    return list.some((item) => String(item._id || item.id) === pid);
};

export const setLocalFavourites = (items: ProductsTableData[]): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(FAVOURITE_STORAGE_KEY, JSON.stringify(items));
        dispatchFavouriteUpdate();
    } catch (err) {
        console.error("Failed to write local favourites to storage:", err);
    }
};

export const toggleLocalFavourite = (product: ProductsTableData): { isFavourite: boolean; count: number } => {
    const pid = String(product._id || product.id);
    const items = getLocalFavourites();
    const existingIndex = items.findIndex((i) => String(i._id || i.id) === pid);

    let updated: ProductsTableData[];
    let isFav = false;

    if (existingIndex > -1) {
        updated = items.filter((i) => String(i._id || i.id) !== pid);
        isFav = false;
    } else {
        updated = [...items, product];
        isFav = true;
    }

    setLocalFavourites(updated);
    return { isFavourite: isFav, count: updated.length };
};

export const removeLocalFavourite = (productId: string): ProductsTableData[] => {
    const pid = String(productId);
    const items = getLocalFavourites();
    const updated = items.filter((i) => String(i._id || i.id) !== pid);
    setLocalFavourites(updated);
    return updated;
};

export const clearLocalFavourites = (): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(FAVOURITE_STORAGE_KEY);
        dispatchFavouriteUpdate();
    } catch (err) {
        console.error("Failed to clear local favourites:", err);
    }
};

export const getLocalFavouriteCount = (): number => {
    return getLocalFavourites().length;
};
