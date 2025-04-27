
import { useUser } from "@clerk/clerk-react";
import { FinancialRecordForm } from "./financial-record-form.js";
import { FinancialRecordList } from "./financial-record-list.js";
import "./financial-record.css";
import { useFinancialRecords } from "../../contexts/financial-record-context.js";
import { useMemo } from "react";
const Dashboard = () =>  {
  const { user } = useUser();
  const { records } = useFinancialRecords();

  const totalMonthly = useMemo(() => {
    let totalAmount = 0;
    records.forEach((record) => {
      totalAmount += record.amount;
    });

    return totalAmount;
  }, [records]);

  return (
    <div className="dashboard-container">
      <h1> Welcome {user?.firstName}! Here Are Your Finances:</h1>
      <FinancialRecordForm />
      <div>Total Monthly: ${totalMonthly}</div>
      <FinancialRecordList />
    </div>
  );
};
export default Dashboard;