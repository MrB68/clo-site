import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster as HotToaster } from "react-hot-toast";
import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductsProvider>
          <RouterProvider router={router} />
          <HotToaster position="top-right" />
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
