import axiosInstance from "./axiosinstance";

export interface AuthResponse {
    token: string,
    refreshToken: string,
    email: string,
    role: string
}

export interface Login {
    email: string,
    password: string
}

export interface Register {
    firstName: string,
    lastName: string,
    email: string,
    contact: number,
    password: string;
    role: string;
}

export interface Order {
    userId: string,
    productId: string,
    date: string,
    paymentMethod: string;
    status: string;
    shipping: string,
    price: string
}

export interface NewPasword {
    token: string;
    password: string;
}

export interface UserResponse {
    success: boolean;
    data: User;
    address: Address[];
}

export interface User {
    firstName: string,
    lastName: string,
    email: string,
    contact: number,
    password: string;
    role: string;
    address: {
        street: string,
        country: string;
        zipCode: number;
        city: string,
        state: string
    },
    order: []
    status: string
}

export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: number;
}

export const authRepository = {

    //get all user
    getUser: async (): Promise<User> => {
        const { data } = await axiosInstance.get<User>("/api/users");
        return data;
    },

    // get userById
    getUserById: async (id: string): Promise<UserResponse> => {
        const { data } = await axiosInstance.get<UserResponse>(`/api/users/${id}`)
        return data;
    },

    // login user
    login: async (formData: Login): Promise<AuthResponse> => {
        const { data } = await axiosInstance.post<AuthResponse>("/api/users/login", formData)
        localStorage.setItem('jwt', data.token)
        localStorage.setItem('refreshToken', data.refreshToken)
        return data;
    },

    // Register user
    Register: async (formData: Register): Promise<AuthResponse> => {
        const { data } = await axiosInstance.post<AuthResponse>("/api/users/signup", formData)
        return data;
    },

    // update user
    updateuser: async (id: string, payload: User): Promise<User> => {
        const { data } = await axiosInstance.put<User>(`/api/users/${id}`, payload)
        return data
    },

    // delete user
    deleteuser: async (id: string): Promise<void> => {
        await axiosInstance.delete<void>(`/api/users/${id}`)
    },

    //verify email
    verifyEmail: async (token: string): Promise<AuthResponse> => {
        const { data } = await axiosInstance.post<AuthResponse>("/api/users/verifyEmail", { token });
        return data;
    },

    // forgot password
    forgotpassword: async (email: string): Promise<AuthResponse> => {
        const { data } = await axiosInstance.post<AuthResponse>("/api/users/forgetpassword", { emailAddress: email });
        return data;
    },

    // reset password
    resetpassword: async (newpassword: NewPasword): Promise<AuthResponse> => {
        const { data } = await axiosInstance.post<AuthResponse>("/api/users/newpassword", newpassword);
        return data;
    },

    //logout
    logout: () => {
        localStorage.clear()
    },

    RefreshToken: async (): Promise<string | null> => {
        const token = localStorage.getItem("jwt");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!token || !refreshToken) return null;

        try {
            const { data } = await axiosInstance.post<{
                token: string;
                refreshToken: string;
            }>("/api/users/refresh", { token, refreshToken });

            const { token: newToken, refreshToken: newRefreshToken } = data;

            localStorage.setItem("jwt", newToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

            return newToken;
        } catch (error) {
            authRepository.logout();
            return null;
        }
    },
}