import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActivityStoreProvider } from "@/contexts/ActivityStoreContext";
import { TicketStoreProvider } from "@/contexts/TicketStoreContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MapPage from "./pages/Map";
import ActivityDetail from "./pages/ActivityDetail";
import DashboardPage from "./pages/Dashboard";
import CreateActivity from "./pages/CreateActivity";
import EditActivity from "./pages/EditActivity";
import TicketView from "./pages/TicketView";
import Account from "./pages/Account";
import AddActivity from "./pages/AddActivity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <ActivityStoreProvider>
            <TicketStoreProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/map" element={<ProtectedRoute allowedType="visitor"><MapPage /></ProtectedRoute>} />
                <Route path="/activity/:id" element={<ProtectedRoute allowedType="visitor"><ActivityDetail /></ProtectedRoute>} />
                <Route path="/ticket/:ticketId" element={<ProtectedRoute allowedType="visitor"><TicketView /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute allowedType="visitor"><Account /></ProtectedRoute>} />
                <Route path="/add-activity" element={<ProtectedRoute allowedType="visitor"><AddActivity /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute allowedType="company"><DashboardPage /></ProtectedRoute>} />
                <Route path="/dashboard/new" element={<ProtectedRoute allowedType="company"><CreateActivity /></ProtectedRoute>} />
                <Route path="/dashboard/edit/:id" element={<ProtectedRoute allowedType="company"><EditActivity /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TicketStoreProvider>
          </ActivityStoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
