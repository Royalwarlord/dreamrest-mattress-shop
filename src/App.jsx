import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderDetails from "./pages/OrderDetails";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AdminProducts from "./pages/AdminProducts";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";







function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* ================================
            CUSTOMER ROUTES
        ================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-success/:orderId"
          element={<OrderSuccess />}
        />

        <Route
          path="/order-details/:orderId"
          element={<OrderDetails />}
        />

        <Route path="/about" element={<About />} />

        <Route
          path="/contact"
          element={<Contact />}
        />


        {/* ================================
            ADMIN LOGIN
        ================================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* ================================
            PROTECTED ADMIN AREA
        ================================= */}

        <Route element={<ProtectedRoute />}>

          <Route element={<AdminLayout />}>

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/orders"
              element={<AdminOrders />}
            />

            <Route
              path="/admin/orders/:orderId"
              element={<AdminOrderDetails />}
            />

            <Route
              path="/admin/products"
              element={<AdminProducts />}
            />

          </Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
}


export default App;