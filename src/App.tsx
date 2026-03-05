import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/layout/ProtectedRoute";
import Login from "@/pages/Login";
import Batches from "@/pages/Batches";
import BatchNew from "@/pages/BatchNew";
import BatchDetail from "@/pages/BatchDetail";
import Admin from "@/pages/Admin";
import SingleQr from "@/pages/SingleQr";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/batches" replace />} />
            <Route path="/batches" element={<ProtectedRoute><Batches /></ProtectedRoute>} />
            <Route path="/batches/new" element={<ProtectedRoute><BatchNew /></ProtectedRoute>} />
            <Route path="/batches/:id" element={<ProtectedRoute><BatchDetail /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
