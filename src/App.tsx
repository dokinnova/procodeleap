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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <main className="pt-16 min-h-screen bg-gradient-to-b from-white to-secondary/20">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/children" element={<Children />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/management" element={<Management />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;