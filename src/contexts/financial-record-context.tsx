import React, { createContext, useState, useContext, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export interface FinancialRecord {
  _id?: string;
  userId: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
}

interface FinancialRecordsContextType {
  records: FinancialRecord[];
  loading: boolean;
  error: string | null;
  addRecord: (record: FinancialRecord) => Promise<void>;
  updateRecord: (id: string, newRecord: FinancialRecord) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const FinancialRecordsContext = createContext<
  FinancialRecordsContextType | undefined
>(undefined);

export const FinancialRecordsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // To debug API connection issues
      console.log("Fetching records from API");
      
      // Use a different endpoint based on whether user is available
      const endpoint = user 
        ? `/api/financial-records/getAllByUserID/${user.id}`
        : `/api/financial-records/all`;
        
      console.log(`Using endpoint: ${endpoint}`);
      const response = await fetch(endpoint);

      if (!response.ok) {
        console.error(`API response error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error("Response body:", errorText);
        throw new Error(`Failed to fetch records (${response.status})`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} records`);
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
      setError(error instanceof Error ? error.message : "Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const addRecord = async (record: FinancialRecord) => {
    setError(null);
    try {
      // Ensure userId is set from the current authenticated user or use default
      const recordWithUserId = {
        ...record,
        userId: user?.id || "default-user"
      };
      
      console.log("Sending record:", recordWithUserId);
      
      const response = await fetch('/api/financial-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordWithUserId),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Failed to add record (${response.status})`);
      }
      
      const savedRecord = await response.json();
      setRecords((prevRecords) => [...prevRecords, savedRecord]);
    } catch (err) {
      console.error("Error adding record:", err);
      setError(err instanceof Error ? err.message : "Failed to add record");
      throw err;
    }
  };

  const updateRecord = async (id: string, newRecord: FinancialRecord) => {
    setError(null);
    try {
      const response = await fetch(`/api/financial-records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Failed to update record (${response.status})`);
      }
      
      const updatedRecord = await response.json();
      setRecords((prevRecords) =>
        prevRecords.map((record) => (record._id === id ? updatedRecord : record))
      );
    } catch (err) {
      console.error("Error updating record:", err);
      setError(err instanceof Error ? err.message : "Failed to update record");
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/financial-records/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Failed to delete record (${response.status})`);
      }
      
      setRecords((prevRecords) =>
        prevRecords.filter((record) => record._id !== id)
      );
    } catch (err) {
      console.error("Error deleting record:", err);
      setError(err instanceof Error ? err.message : "Failed to delete record");
      throw err;
    }
  };

  return (
    <FinancialRecordsContext.Provider
      value={{ records, loading, error, addRecord, updateRecord, deleteRecord }}
    >
      {children}
    </FinancialRecordsContext.Provider>
  );
};

export const useFinancialRecords = () => {
  const context = useContext<FinancialRecordsContextType | undefined>(
    FinancialRecordsContext
  );

  if (!context) {
    throw new Error(
      "useFinancialRecords must be used within a FinancialRecordsProvider"
    );
  }

  return context;
};