import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gradient-to-br from-background to-secondary/50">
              <Navigation 
                isMobileMenuOpen={isMobileMenuOpen} 
                setIsMobileMenuOpen={setIsMobileMenuOpen} 
              />
              <main 
                className={`flex-1 transition-all duration-300 ease-in-out
                  ${isMobileMenuOpen ? 'ml-0' : 'ml-0 md:ml-64'} 
                  p-4 md:p-8 overflow-auto`}
              >
                <div className="max-w-7xl mx-auto space-y-8">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/children" element={<Children />} />
                    <Route path="/sponsors" element={<Sponsors />} />
                    <Route path="/management" element={<Management />} />
                    <Route path="/schools" element={<Schools />} />
                    <Route path="/configuration" element={<Configuration />} />
                    <Route path="/receipts" element={<Receipts />} />
                    <Route path="/crm" element={<CRM />} />
                    <Route path="/reports/children" element={<ChildrenReport />} />
                    <Route path="/reports/sponsors" element={<SponsorsReport />} />
                    <Route path="/reports/schools" element={<SchoolsReport />} />
                    <Route path="/reports/sponsorships" element={<SponsorshipsReport />} />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
