import React, { useEffect, useState } from "react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import "./home.css";

interface MonthlyData {
  month: string;
  amount: number;
  count: number;
}

const HomePage: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        // Update this path
        const response = await fetch('/financial-records/monthlyTotals');
        
        if (!response.ok) {
          throw new Error('Failed to fetch monthly data');
        }
        
        const data = await response.json();
        setMonthlyData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching monthly data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMonthlyData();
  }, []);
  
  return (
    <div className="home-container">
      <h1 className="home-title">Personal Finance Visualizer</h1>
      
      <div className="chart-box">
        <h2 className="chart-heading">Monthly Expenses (2025)</h2>
        
        {loading ? (
          <div className="loading">Loading expense data...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar 
                name="Monthly Expenses" 
                dataKey="amount" 
                fill="#a855f7" 
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default HomePage;