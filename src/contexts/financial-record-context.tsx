import { useUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState } from "react";

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
  addRecord: (record: FinancialRecord) => void;
  updateRecord: (id: string, newRecord: FinancialRecord) => void;
  deleteRecord: (id: string) => void;
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
  const { user } = useUser();

  // In the fetchRecords function:
const fetchRecords = async () => {
  try {
    // Use a different endpoint based on whether user is available
    const endpoint = user 
      ? `/api/financial-records/getAllByUserID/${user.id}`
      : `/api/financial-records/all`;
      
    const response = await fetch(endpoint);

    if (response.ok) {
      const records = await response.json();
      console.log(records);
      setRecords(records);
    }
  } catch (error) {
    console.error("Error fetching records:", error);
  }
};

  useEffect(() => {
    fetchRecords();
  }, [user]);

  // In the addRecord function:
const addRecord = async (record: FinancialRecord) => {
  try {
    // Ensure userId is set from the current authenticated user or use default
    const recordWithUserId = {
      ...record,
      userId: user?.id || "default-user"
    };
    
    console.log("Sending record:", recordWithUserId);
    
    const response = await fetch("/api/financial-records", {
      method: "POST",
      body: JSON.stringify(recordWithUserId),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const newRecord = await response.json();
      setRecords((prev) => [...prev, newRecord]);
    } else {
      const error = await response.json();
      console.error("Error adding record:", error);
    }
  } catch (err) {
    console.error("Exception adding record:", err);
  }
};

  const updateRecord = async (id: string, newRecord: FinancialRecord) => {
    try {
      // Ensure userId is preserved when updating
      const recordWithUserId = {
        ...newRecord,
        userId: user?.id || newRecord.userId
      };
      
      const response = await fetch(
        `/api/financial-records/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(recordWithUserId),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const updatedRecord = await response.json();
        setRecords((prev) =>
          prev.map((record) => {
            if (record._id === id) {
              return updatedRecord;
            } else {
              return record;
            }
          })
        );
      } else {
        const error = await response.json();
        console.error("Error updating record:", error);
      }
    } catch (err) {
      console.error("Exception updating record:", err);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const response = await fetch(
        `/api/financial-records/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const deletedRecord = await response.json();
        setRecords((prev) =>
          prev.filter((record) => record._id !== deletedRecord._id)
        );
      } else {
        const error = await response.json();
        console.error("Error deleting record:", error);
      }
    } catch (err) {
      console.error("Exception deleting record:", err);
    }
  };

  return (
    <FinancialRecordsContext.Provider
      value={{ records, addRecord, updateRecord, deleteRecord }}
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