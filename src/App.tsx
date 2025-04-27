import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashBoard from "./pages/dashboard/Dashboard.tsx";
import { Auth } from "./pages/auth/index.js";
import { FinancialRecordsProvider } from "./contexts/financial-record-context.tsx";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import Home from "./pages/home/home.tsx";

function App() {
  return (
    <Router> 
      <FinancialRecordsProvider>
        <div className="app-container">
          <div className="navbar">
            <Link to="/home">Home</Link>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
          <Routes>
            <Route
              path="/"
              element={<DashBoard />}
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </div>
      </FinancialRecordsProvider>
    </Router>
  );
}

export default App;