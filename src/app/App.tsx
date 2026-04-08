import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster as HotToaster } from "react-hot-toast";
import { ScrollToTop } from "./components/ScrollToTop";
import { WishlistProvider } from "./contexts/WishlistContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ToastProvider from "./components/ToastProvider";


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductsProvider>
          <WishlistProvider>
            <NotificationProvider>
              <RouterProvider router={router} />
              <ToastProvider />
            </NotificationProvider>
          </WishlistProvider>
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
