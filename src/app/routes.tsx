import { createBrowserRouter, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ScrollToTop } from "./components/ScrollToTop";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { About } from "./pages/About";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
//import { CustomDesign } from "./pages/CustomDesign";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { SignIn } from "./pages/SignIn";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Orders } from "./pages/Orders";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { NotFound } from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import { supabase } from "../lib/supabase";
import Shipping from "./pages/Shipping";
import SizeGuide from "./pages/SizeGuide";
import Contact from "./pages/Contact";
import CustomerService from "./pages/CustomerService";
import PaymentSuccess from "./pages/PaymentSuccess";
import Collections from "./pages/Collections";
import Sale from "./pages/Sale";
import NewArrivals from "./pages/NewArrivals";
import BestSellers from "./pages/BestSellers";
import Wishlist from "./pages/Wishlist";
import CollectionDetail from "./pages/CollectionDetail";
import { Layout } from "./components/Layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return session ? <>{children}</> : <Navigate to="/signin" />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => (
      <>
        <ScrollToTop />
        <Layout />
      </>
    ),
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      { path: "about", Component: About },
      { path: "cart", Component: Cart },
      {
        path: "checkout",
        Component: () => (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      //{ path: "custom", Component: CustomDesign },
      { path: "signin", Component: SignIn },
      { path: "register", Component: Register },
      { path: "auth/callback", Component: AuthCallback },
      {
        path: "orders",
        Component: () => (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        Component: () => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      { path: "terms", Component: Terms },
      { path: "privacy", Component: Privacy },
      { path: "shipping", Component: Shipping },
      { path: "size-guide", Component: SizeGuide },
      { path: "contact", Component: Contact },
      { path: "customer-service", Component: CustomerService },
      { path: "collections", Component: Collections },
      { path: "sale", Component: Sale },
      { path: "new-arrivals", Component: NewArrivals },
      { path: "best-sellers", Component: BestSellers },
      { path: "wishlist", Component: Wishlist },
      { path: "collections/:category", Component: CollectionDetail },
      { path: "*", Component: NotFound },
      
    ],
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/payment-success",
    Component: PaymentSuccess,
  },
]);
