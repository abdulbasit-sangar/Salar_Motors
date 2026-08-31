import { AuthProvider } from "./store/auth/AuthContext.jsx";
import { ToastProvider } from "./store/ui/ToastContext.jsx";
import { ToastViewport } from "./shared/components/ToastViewport.jsx";
import { AppRouter } from "./app/router/AppRouter.jsx";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRouter />
        <ToastViewport />
      </AuthProvider>
    </ToastProvider>
  );
}
