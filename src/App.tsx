import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPatients from "./pages/AdminPatients";
import AdminTreatmentsPage from "./pages/AdminTreatmentsPage";
import AdminReports from "./pages/AdminReports";
import Dashboard from "./pages/Dashboard";
import MyTreatments from "./pages/MyTreatments";
import History from "./pages/History";
import RecoveryReports from "./pages/RecoveryReports";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import MedicalRecords from "./pages/MedicalRecords";
import HealthSummary from "./pages/HealthSummary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-patients" element={<AdminPatients />} />
            <Route path="/admin-treatments" element={<AdminTreatmentsPage />} />
            <Route path="/admin-reports" element={<AdminReports />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mytreatments"
              element={
                <ProtectedRoute>
                  <MyTreatments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recovery-reports"
              element={
                <ProtectedRoute>
                  <RecoveryReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records"
              element={
                <ProtectedRoute>
                  <MedicalRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-summary"
              element={
                <ProtectedRoute>
                  <HealthSummary />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
