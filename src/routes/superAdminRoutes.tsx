import { Routes, Route, Navigate } from "react-router-dom";
import AuthProtection from "../component/authProtection";
import SuperAdminLayout from "../view/superAdmin/superAdminLayout";
import SuperAdminDashboard from "../view/superAdmin/Dashboard/dashboard";
import ProductTable from "../view/superAdmin/Products/productTable";
import OrderTable from "../view/superAdmin/Orders/orderTable";
import AddProducts from "../view/admin/products/addproduct";

/**
 * SuperAdminRoutes
 * Protected routes module dedicated to Admin and Super Admin users.
 */
export default function SuperAdminRoutes() {
  return (
    <AuthProtection allowedRoles={["admin"]}>
      <Routes>
        <Route element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="products" element={<ProductTable />} />
          <Route path="addproduct" element={<AddProducts />} />
          <Route path="orders" element={<OrderTable />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProtection>
  );
}
