import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { About } from "./pages/About";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { CustomDesign } from "./pages/CustomDesign";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { SignIn } from "./pages/SignIn";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Orders } from "./pages/Orders";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { NotFound } from "./pages/NotFound";
import Shipping from "./pages/Shipping";
import SizeGuide from "./pages/SizeGuide";
import Contact from "./pages/Contact";
import CustomerService from "./pages/CustomerService";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      { path: "about", Component: About },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "custom", Component: CustomDesign },
      { path: "signin", Component: SignIn },
      { path: "register", Component: Register },
      { path: "orders", Component: Orders },
      { path: "profile", Component: Profile },
      { path: "terms", Component: Terms },
      { path: "privacy", Component: Privacy },
      { path: "shipping", Component: Shipping },
      { path: "size-guide", Component: SizeGuide },
      { path: "contact", Component: Contact },
      { path: "customer-service", Component: CustomerService },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
]);
