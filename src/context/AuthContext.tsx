import { jwtDecode } from "jwt-decode";
import { createContext, useState, useContext, useEffect } from "react";
import { authRepository, Login, Register, User } from "../api/authRepository";
import { cartApi } from "../api/cart";
import { getLocalCart, clearLocalCart, dispatchCartUpdate } from "../utils/cartStorage";
import { productRepository } from "../api/product";
import { getLocalFavourites, clearLocalFavourites, dispatchFavouriteUpdate } from "../utils/favouriteStorage";


export interface AuthContextType {
    token: string | null;
    email: string | null;
    role: string | null;
    userId: string | null;
    user: User | null;
    signIn: (signin: Login) => Promise<void>;
    signUp: (signup: Register) => Promise<void>;
    logout: () => void;
}

export interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>( () => localStorage.getItem("jwt"));
    const [userId, setUserId] = useState<string | null>(()=> localStorage.getItem("userId"));
    const [email, setEmail] = useState<string | null>(()=> localStorage.getItem("email"));
    const [role, setRole] = useState<string | null>(()=> localStorage.getItem("role"));


    const saveTokenData = (newToken: string) => {
        try {
            const decoded = jwtDecode<JwtPayload>(newToken);
            const { id, email, role } = decoded;

            setUserId(id);
            setEmail(email);
            setRole(role);
            localStorage.setItem('userId', id);
            localStorage.setItem('email', email);
            localStorage.setItem('role', role);
        } catch (error) {
            console.error('Failed to decode token:', error);
        }
    };

    const syncGuestCartToDatabase = async () => {
        try {
            const guestCart = getLocalCart();
            if (guestCart && guestCart.length > 0) {
                const itemsToSync = guestCart.map((item) => ({
                    productId: item.productId || item.id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    category: item.category,
                    image: item.images?.length ? item.images : item.image ? [item.image] : [],
                    brand: item.brand,
                    description: item.description,
                }));

                await cartApi.syncGuestCart(itemsToSync);
                clearLocalCart();
            }
        } catch (e) {
            console.error("Failed to sync guest cart on login:", e);
        }
    };

    const syncGuestFavouritesToDatabase = async () => {
        try {
            const guestFavs = getLocalFavourites();
            if (guestFavs && guestFavs.length > 0) {
                const itemsToSync = guestFavs.map((item) => ({
                    productId: item._id || item.id,
                    title: item.title,
                    price: item.price,
                    category: item.category,
                    image: Array.isArray(item.image) ? item.image : item.image ? [item.image] : [],
                    brand: item.brand,
                    description: item.description,
                    rating: item.rating,
                }));

                await productRepository.syncFavourites(itemsToSync);
                clearLocalFavourites();
            }
        } catch (e) {
            console.error("Failed to sync guest favourites on login:", e);
        }
    };

    const signIn = async (signin: Login) => {
        const { token: newToken, refreshToken } = await authRepository.login(signin)
        localStorage.setItem('jwt', newToken)
        localStorage.setItem('refreshToken', refreshToken)
        saveTokenData(newToken)
        setToken(newToken)

        // Migrate guest cart and favourites to database
        await syncGuestCartToDatabase();
        await syncGuestFavouritesToDatabase();
        dispatchCartUpdate();
        dispatchFavouriteUpdate();
    }

    const signUp = async (signUpData: Register) => {
        const { token: newToken, refreshToken } = await authRepository.Register(signUpData)
        if (newToken) {
            localStorage.setItem('jwt', newToken)
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
            saveTokenData(newToken)
            setToken(newToken)

            // Migrate guest cart and favourites to database if registration signs in
            await syncGuestCartToDatabase();
            await syncGuestFavouritesToDatabase();
            dispatchCartUpdate();
            dispatchFavouriteUpdate();
        }
    }

    const logout = () => {
        authRepository.logout();
        clearLocalCart();
        clearLocalFavourites();
        localStorage.clear();
        setEmail(null);
        setToken(null);
        setRole(null);
        setUserId(null);
        setUser(null);
        dispatchCartUpdate();
        dispatchFavouriteUpdate();
    }


    useEffect(() => {
        if (!token) {
            setEmail(null);
            setRole(null);
            setUserId(null);
            setUser(null);
            return;
        }

        try {
            saveTokenData(token);
        } catch (error) {
            console.error("Invalid token:", error);
            //logout();
        }
    }, [token]);

    return (
        <AuthContext.Provider
            value={{ role, token, email, signIn, signUp, logout, user, userId }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};