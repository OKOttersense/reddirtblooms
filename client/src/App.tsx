import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useLocation } from "wouter";

// Lazy load all pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const BloomDiary = lazy(() => import("./pages/BloomDiary"));
const WhatsInTheGround = lazy(() => import("./pages/WhatsInTheGround"));
const HarvestStand = lazy(() => import("./pages/HarvestStand"));
const RootsAndStory = lazy(() => import("./pages/RootsAndStory"));
const ComeFindUs = lazy(() => import("./pages/ComeFindUs"));
const FloristPortal = lazy(() => import("./pages/FloristPortal"));
const FloristRegister = lazy(() => import("./pages/FloristRegister"));
const FloristLogin = lazy(() => import("./pages/FloristLogin"));
const FloristForgotPassword = lazy(() => import("./pages/FloristForgotPassword"));
const FloristResetPassword = lazy(() => import("./pages/FloristResetPassword"));
const FloristDashboard = lazy(() => import("./pages/FloristDashboard"));
const FloristPortfolio = lazy(() => import("./pages/FloristPortfolio"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DiaryAdmin = lazy(() => import("./pages/DiaryAdmin"));
const CSALanding = lazy(() => import("./pages/CSALanding"));
const Gallery = lazy(() => import("./pages/Gallery"));
const BloomDiaryGallery = lazy(() => import("./pages/BloomDiaryGallery"));
const WhatsInTheGroundGallery = lazy(() => import("./pages/WhatsInTheGroundGallery"));
const MasterGallery = lazy(() => import("./pages/MasterGallery"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const BouquetBar = lazy(() => import("./pages/BouquetBar"));
const SeasonalCalendar = lazy(() => import("./pages/SeasonalCalendar"));
const FloristLeaveBehind = lazy(() => import("./pages/FloristLeaveBehind"));
const FloristSampleCards = lazy(() => import("./pages/FloristSampleCards"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Non-lazy (always needed)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DustyChat from "./components/DustyChat";
import BloomBoxPopup from "./components/BloomBoxPopup";

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bloom-diary" component={BloomDiary} />
        <Route path="/whats-in-the-ground" component={WhatsInTheGround} />
        <Route path="/harvest-stand" component={HarvestStand} />
        <Route path="/roots-and-story" component={RootsAndStory} />
        <Route path="/come-find-us" component={ComeFindUs} />
        <Route path="/florist-portal" component={FloristPortal} />
        <Route path="/florist-register" component={FloristRegister} />
        <Route path="/florist-login" component={FloristLogin} />
        <Route path="/florist-forgot-password" component={FloristForgotPassword} />
        <Route path="/florist-reset-password" component={FloristResetPassword} />
        <Route path="/florist-dashboard" component={FloristDashboard} />
        <Route path="/florist-portfolio" component={FloristPortfolio} />
        <Route path="/order-success" component={OrderSuccess} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/diary-admin" component={DiaryAdmin} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/bloom-diary-gallery" component={BloomDiaryGallery} />
        <Route path="/whats-in-ground-gallery" component={WhatsInTheGroundGallery} />
        <Route path="/master-gallery" component={MasterGallery} />
        <Route path="/csa" component={CSALanding} />
        <Route path="/why-us" component={WhyUs} />
        <Route path="/bouquet-bar" component={BouquetBar} />
        <Route path="/seasonal-calendar" component={SeasonalCalendar} />
        <Route path="/florist-leave-behind" component={FloristLeaveBehind} />
        <Route path="/florist-sample-cards" component={FloristSampleCards} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [location] = useLocation();
  const isCSA = location === "/csa";
  const isBouquetBar = location === "/bouquet-bar";
  const isFloristAuth = ["/florist-register", "/florist-login", "/florist-forgot-password", "/florist-reset-password", "/florist-dashboard"].includes(location);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {!isCSA && !isBouquetBar && !isFloristAuth && <Navbar />}
          <Router />
          {!isCSA && !isBouquetBar && !isFloristAuth && <Footer />}
          {!isCSA && !isBouquetBar && !isFloristAuth && <DustyChat />}
          <BloomBoxPopup />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
