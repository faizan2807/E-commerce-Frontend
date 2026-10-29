import axiosInstance from "./axiosinstance";

export interface ProductFormData {
    title: string;
    description: string;
    price: number;
    category: string;
    image: string[];
    rating: {
        rate: number;
        count: number;
    },
    brand: string;
    sellerId: string;
    status: "Available" | "Unavailable" | "Out Of Stock" | "";
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    brand?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    [key: string]: any;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
}

export interface PaginatedProductsResponse {
    success: boolean;
    data: ProductsTableData[];
    pagination?: PaginationMeta;
    total?: number;
    totalPages?: number;
    page?: number;
    limit?: number;
}

export interface ProductsData {
    success: boolean;
    data: ProductsTableData[];
    pagination?: PaginationMeta;
}

export interface TrendingCriteria {
    limit?: number;
    category?: string;
    timeframeDays?: number;
    minRating?: number;
    sortBy?: "combined" | "orders" | "rating";
}


export interface ProductsTableData {
    id: string;
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image: string[];
    rating: {
        rate: number;
        count: number;
    };
    brand: string;
    sellerId: string;
    status: "Available" | "Unavailable" | "Out Of Stock" | "";
    favourite?: boolean;
}

export const productRepository = {
    // get all product (supports optional pagination and filtering parameters)
    getAllProduct: async (params?: PaginationParams): Promise<PaginatedProductsResponse> => {
        const response = await axiosInstance.get<PaginatedProductsResponse>("/api/product", {
            params: params
                ? {
                    page: params.page,
                    limit: params.limit,
                    search: params.search ? params.search.trim() : undefined,
                    status: params.status && params.status !== "all" ? params.status : undefined,
                    category: params.category && params.category !== "all" ? params.category : undefined,
                    brand: params.brand && params.brand !== "all" ? params.brand : undefined,
                    sortBy: params.sortBy,
                    sortOrder: params.sortOrder,
                }
                : undefined,
        });
        return response.data;
    },

    // get product by search
    getProductBySearch: async (
        search: string
    ): Promise<ProductsData> => {

        const response = await axiosInstance.get<ProductsData>(
            "/api/product/search",
            {
                params: {
                    search,
                },
            }
        );
        return response.data;
    },

    // get productById
    getProductById: async (_id: string): Promise<ProductsData> => {
        const { data } = await axiosInstance.get<ProductsData>(`/api/product/${_id}`)
        return data;
    },

    // get productByCategory
    getproductByCategory: async (category: string): Promise<ProductsData> => {
        const { data } = await axiosInstance.get<ProductsData>(`/api/product/category/${category}`)
        return data;
    },

    // get favourite products by userId
    getFavouriteProducts: async (userId?: string): Promise<ProductsData> => {
        const uid = userId || localStorage.getItem("userId") || "";
        const endpoint = uid ? `/api/product/favourite/${uid}` : "/api/product/favourite";
        const { data } = await axiosInstance.get<ProductsData>(endpoint);
        return data;
    },

    // post fev product with userId
    postFavouriteProductsByUserId: async (
        _id: string,
        userId?: string,
        favourite?: boolean
    ): Promise<{ success: boolean; message?: string; data?: any; favourite?: boolean }> => {
        const uid = userId || localStorage.getItem("userId") || "";
        const payload: { userId?: string; favourite?: boolean } = {};
        if (uid) payload.userId = uid;
        if (favourite !== undefined) payload.favourite = favourite;

        const { data } = await axiosInstance.post<{
            success: boolean;
            message?: string;
            data?: any;
            favourite?: boolean;
        }>(`/api/product/favourite/${_id}`, payload);
        return data;
    },

    // post / toggle favourite product compatibility
    postFavouriteProducts: async (
        _id: string,
        userId?: string,
        favourite?: boolean
    ): Promise<{ success: boolean; message?: string; data?: any; favourite?: boolean }> => {
        return productRepository.postFavouriteProductsByUserId(_id, userId, favourite);
    },

    // batch sync favourite products upon login
    syncFavourites: async (items: any[]): Promise<{ success: boolean; message?: string; count?: number }> => {
        const { data } = await axiosInstance.post<{
            success: boolean;
            message?: string;
            count?: number;
        }>("/api/product/favourite/sync", { items });
        return data;
    },

    postproduct: async (product: FormData): Promise<ProductFormData> => {
        const { data } = await axiosInstance.post<ProductFormData>("/api/product/post-product", product);
        return data;
    },

    // update product
    updateproduct: async (_id: string, formdata: FormData): Promise<ProductsData> => {
        const { data } = await axiosInstance.put<ProductsData>(`/api/product/update/${_id}`, formdata)
        return data;
    },

    // delete product
    deleteProduct: async (_id: string): Promise<void> => {
        await axiosInstance.delete(`/api/product/${_id}`)
        return;
    },

    // trending product api
    getTrendingProducts: async (limit: number = 8, category?: string) => {
        try {
            const params: Record<string, any> = { limit };
            if (category) params.category = category;
            const response = await axiosInstance.get("/api/product/trending", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching trending products:", error);
            throw error;
        }
    },

    // post trending product api
    postTrendingProducts: async (criteria: TrendingCriteria = {}) => {
        try {
            const response = await axiosInstance.post("/api/product/trending", criteria);
            return response.data;
        } catch (error) {
            console.error("Error calculating trending products:", error);
            throw error;
        }
    },

    // get app product
    getAppProduct: async (params?: PaginationParams): Promise<PaginatedProductsResponse> => {
        return productRepository.getAllProduct(params);
    }
};

export const getTrendingProducts = productRepository.getTrendingProducts;
export const postTrendingProducts = productRepository.postTrendingProducts;
export const getAppProduct = productRepository.getAppProduct;