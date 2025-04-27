import { useUser } from "@clerk/clerk-react";
import { FinancialRecordForm } from "./financial-record-form.tsx";
import { FinancialRecordList } from "./financial-record-list.tsx";
import "./financial-record.css";
import { useFinancialRecords } from "../../contexts/financial-record-context.tsx";
import { useMemo, useState } from "react";

const Dashboard = () => {
  const { user } = useUser();
  const { records, error, loading } = useFinancialRecords();
  const [retryCount, setRetryCount] = useState(0);

  const totalMonthly = useMemo(() => {
    let totalAmount = 0;
    records.forEach((record) => {
      totalAmount += record.amount;
    });
    return totalAmount;
  }, [records]);

  const handleRetry = () => {
    setRetryCount(count => count + 1);
    window.location.reload();
  };

  // Show a loading state
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading your financial data...</p>
        <p className="loading-tip">This may take a moment if connecting for the first time.</p>
      </div>
    );
  }

  // Show an error state with retry button
  if (error) {
    // After 3 retries, suggest alternatives
    if (retryCount >= 3) {
      return (
        <div className="error-state">
          <h2>Connection issues detected</h2>
          <p>We're having trouble connecting to our database. This might be due to:</p>
          <ul>
            <li>High server load (MongoDB Atlas free tier limits)</li>
            <li>Temporary connection issues</li>
            <li>Deployment initialization (first load can be slow)</li>
          </ul>
          
          <div className="error-options">
            <button onClick={handleRetry} className="button">Retry Connection</button>
            <button 
              onClick={() => {
                // Show a fallback UI with sample data
                setRetryCount(0);
              }} 
              className="button secondary"
            >
              Continue with Sample Data
            </button>
          </div>
          
          <details>
            <summary>Technical details</summary>
            <p className="error-message">{error}</p>
          </details>
        </div>
      );
    }
    
    return (
      <div className="error-state">
        <h2>Unable to load your financial data</h2>
        <p>We're experiencing connection issues with our database. Please try again.</p>
        <button onClick={handleRetry} className="button">Try Again</button>
        <details>
          <summary>Technical details</summary>
          <p className="error-message">{error}</p>
        </details>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome {user?.firstName || 'User'}! Here Are Your Finances:</h1>
      <FinancialRecordForm />
      <div className="financial-summary">
        <div className="summary-item">
          <div className="summary-label">Total Monthly</div>
          <div className="summary-value">${totalMonthly.toFixed(2)}</div>
        </div>
      </div>
      <FinancialRecordList />
    </div>
  );
};

export default Dashboard;