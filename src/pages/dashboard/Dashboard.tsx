import { useUser } from "@clerk/clerk-react";
import { FinancialRecordForm } from "./financial-record-form.tsx";
import { FinancialRecordList } from "./financial-record-list.tsx";
import "./financial-record.css";
import { useFinancialRecords } from "../../contexts/financial-record-context.tsx";
import { useMemo } from "react";

const Dashboard = () =>  {
  const { user } = useUser();
  const { records, error, loading } = useFinancialRecords();

  const totalMonthly = useMemo(() => {
    let totalAmount = 0;
    records.forEach((record) => {
      totalAmount += record.amount;
    });

    return totalAmount;
  }, [records]);

  // Show a loading state
  if (loading) {
    return <div className="loading-state">Loading your financial data...</div>;
  }

  // Show an error state with retry button
  if (error) {
    return (
      <div className="error-state">
        <h2>Unable to load your financial data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1> Welcome {user?.firstName || 'User'}! Here Are Your Finances:</h1>
      <FinancialRecordForm />
      <div>Total Monthly: ${totalMonthly.toFixed(2)}</div>
      <FinancialRecordList />
    </div>
  );
};

export default Dashboard;