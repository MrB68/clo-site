import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductsProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
