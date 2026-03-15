import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";

export default function App() {
  const { isConnected } = useAccount();
  const [inApp, setInApp] = useState(false);

  // Show dashboard if user clicked "Launch App" or connected wallet
  const showDashboard = inApp || isConnected;

  return (
    <div style={{ minHeight: "100vh" }}>
      {showDashboard ? (
        <Dashboard
          ConnectButton={ConnectButton}
          isConnected={isConnected}
          onBackToHome={() => setInApp(false)}
        />
      ) : (
        <LandingPage onEnterApp={() => setInApp(true)} />
      )}
    </div>
  );
}
