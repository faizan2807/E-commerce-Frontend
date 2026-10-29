import axiosInstance from "./axiosinstance";





export interface DashboardSummary {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    outOfStockCount: number;
}

export interface OutOfStockProduct {
    _id: string;
    title: string;
    price: number;
    category: string;
    image: string[];
    brand: string;
    status: string;
    sellerId: string;
    createdAt: string;
}

export interface TimelinePeriod {
    period: string;
    ordersCount: number;
    revenue: number;
    newProductsAdded: number;
}

export interface TimelineAnalytics {
    last0To7Days: TimelinePeriod;
    last7To15Days: TimelinePeriod;
    last15To30Days: TimelinePeriod;
    last30to180Days: TimelinePeriod;
    last180to365Days: TimelinePeriod;
}

export interface DashboardData {
    summary: DashboardSummary;
    outOfStockProducts: OutOfStockProduct[];
    timelineAnalytics: TimelineAnalytics;
}

export interface DashboardResponse {
    success: boolean;
    message: string;
    data: DashboardData;
}


export const DashboardRepo = {
    getDashBoard: async (range?: string): Promise<DashboardResponse> => {
        const { data } = await axiosInstance.get<DashboardResponse>("/api/dashboard", {
            params: range ? { range } : undefined,
        });
        return data;
    }
}