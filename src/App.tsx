
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./lib/redux/store";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Marketplace from "./pages/Marketplace";
import SendPay from "./pages/SendPay";
import Verification from "./pages/Verification";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Receive from "./pages/Receive";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Portfolio from "./pages/Portfolio";
import ApiDocs from "./pages/ApiDocs";
import { Providers } from "./lib/providers";
import { OnchainProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

const App = () => (
  <Providers>
    <OnchainProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/send" element={<SendPay />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/deposit" element={<Deposit />} />
                  <Route path="/withdraw" element={<Withdraw />} />
                  <Route path="/receive" element={<Receive />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/apidocs" element={<ApiDocs />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </OnchainProvider>
  </Providers>
);

export default App;
