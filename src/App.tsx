import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Children from "./pages/Children";
import Sponsors from "./pages/Sponsors";
import Management from "./pages/Management";
import Schools from "./pages/Schools";
import Configuration from "./pages/Configuration";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ProtectedRoute>
          <div className="flex min-h-screen bg-[#F8FAFC]">
            <Navigation />
            <main className="flex-1 ml-64 p-8 transition-all duration-300 ease-in-out">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/children" element={<Children />} />
                  <Route path="/sponsors" element={<Sponsors />} />
                  <Route path="/management" element={<Management />} />
                  <Route path="/schools" element={<Schools />} />
                  <Route path="/configuration" element={<Configuration />} />
                </Routes>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;