import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme/theme";
import NotFound from "./view/admin/main/404/404";
import SignUp from "./view/auth/signup/signup";
import SignIn from "./view/auth/signin/signin";
import Verification from "./view/auth/verification/verification";
import Home from "./view/admin/main/home/home";
import HomeShowcase from "./view/admin/main/home/homeShowcase";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
//import AddProducts from "./view/admin/products/addproduct";
import ProductDetails from "./view/admin/productDetail/productdetail";
import FevouriteProduct from "./view/admin/fev/fev";
import Cart from "./view/admin/cart/cart";
import Order from "./view/admin/order/order";
import CategoryProduct from "./view/admin/category/categoryProduct";
import SuperAdminRoutes from "./routes/superAdminRoutes";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <BrowserRouter>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <AlertProvider>
            <Routes>
              {/* Main Layout containing persistent Navbar and Footer */}
              <Route path="/" element={<Home />}>
                <Route index element={<HomeShowcase />} />
                <Route path="Shopio" element={<HomeShowcase />} />
                <Route path="Shopio/favourite" element={<FevouriteProduct />} />
                <Route path="Shopio/category/:categoryName" element={<CategoryProduct />} />
                <Route path="Shopio/productDetails/:productId" element={<ProductDetails />} />
                <Route path="Shopio/cart" element={<Cart />} />
                <Route path="Shopio/order" element={<Order />} />
              </Route>

              {/* Super Admin Protected Routes (Separate layout and authentication) */}
              <Route path="/superadmin/*" element={<SuperAdminRoutes />} />
              <Route path="/Shopio/superadmin/*" element={<SuperAdminRoutes />} />

              {/* Auth Routes */}
              <Route path="Shopio/login" element={<SignIn />} />
              <Route path="Shopio/register" element={<SignUp />} />
              <Route path="Shopio/verification" element={<Verification />} />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AlertProvider>
        </ChakraProvider>
      </AuthProvider>
    </BrowserRouter>
  </>
);