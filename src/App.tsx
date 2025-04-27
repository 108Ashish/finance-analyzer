import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DashBoard from "../src/pages/dashboard/Dashboard.tsx";
 import { Auth } from "./pages/auth";
import { FinancialRecordsProvider } from "./contexts/financial-record-context";
import { SignedIn, UserButton } from "@clerk/clerk-react";
// import { dark } from "@clerk/themes";
import Home from "../src/pages/home/home.tsx";

function App() {
  return (
    <Router> 
      <FinancialRecordsProvider>
      <div className="app-container">
        <div className="navbar">
          
          <Link to="/home"> <Home/></Link>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <Routes>
          <Route
            path="/"
            element={
             
                <DashBoard />
               
              
            }
          />
          <Route path="/auth" element={<Auth />} />
       
        </Routes>
      </div>
    </FinancialRecordsProvider></Router>
  );
}

export default App;