import { useMemo, useState } from "react";
import {
  FinancialRecord,
  useFinancialRecords,
} from "../../contexts/financial-record-context";
import { useTable, Column, CellProps } from "react-table";

interface EditableCellProps extends CellProps<FinancialRecord> {
  updateRecord: (rowIndex: number, columnId: string, value: any) => void;
  editable: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value: initialValue,
  row,
  column,
  updateRecord,
  editable,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    setIsEditing(false);
    updateRecord(row.index, column.id, value);
  };

  // Format date values properly
  const displayValue = () => {
    if (column.id === "date" && initialValue) {
      // Format date as a readable string
      return new Date(initialValue).toLocaleDateString();
    } else if (typeof initialValue === "string") {
      return initialValue;
    } else if (initialValue === undefined || initialValue === null) {
      return "";
    } else {
      return initialValue.toString();
    }
  };

  return (
    <div
      onClick={() => editable && setIsEditing(true)}
      style={{ cursor: editable ? "pointer" : "default" }}
    >
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          onBlur={onBlur}
          style={{ width: "100%" }}
        />
      ) : (
        displayValue()
      )}
    </div>
  );
};

export const FinancialRecordList = () => {
  const { records, updateRecord, deleteRecord } = useFinancialRecords();
  
  // Add loading state for better UX
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateCellRecord = async (rowIndex: number, columnId: string, value: any) => {
    // Don't update if the record doesn't exist
    if (!records[rowIndex] || !records[rowIndex]._id) return;
    
    const id = records[rowIndex]._id as string;
    const recordToUpdate = { ...records[rowIndex] };
    
    // Handle conversion for numeric fields
    if (columnId === "amount") {
      // Convert value to number for amount field
      recordToUpdate[columnId] = parseFloat(value);
    } else {
      recordToUpdate[columnId] = value;
    }
    
    setIsLoading(true);
    try {
      await updateRecord(id, recordToUpdate);
    } catch (error) {
      console.error("Error updating record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Array<Column<FinancialRecord>> = useMemo(
    () => [
      {
        Header: "Description",
        accessor: "description",
        Cell: (props) => (
          <EditableCell
            {...props}
            updateRecord={updateCellRecord}
            editable={true}
          />
        ),
      },
      {
        Header: "Amount",
        accessor: "amount",
        Cell: (props) => (
          <EditableCell
            {...props}
            updateRecord={updateCellRecord}
            editable={true}
          />
        ),
      },
      {
        Header: "Category",
        accessor: "category",
        Cell: (props) => (
          <EditableCell
            {...props}
            updateRecord={updateCellRecord}
            editable={true}
          />
        ),
      },
      {
        Header: "Payment Method",
        accessor: "paymentMethod",
        Cell: (props) => (
          <EditableCell
            {...props}
            updateRecord={updateCellRecord}
            editable={true}
          />
        ),
      },
      {
        Header: "Date",
        accessor: "date",
        Cell: (props) => (
          <EditableCell
            {...props}
            updateRecord={updateCellRecord}
            editable={false}
          />
        ),
      },
      {
        Header: "Delete",
        id: "delete",
        Cell: ({ row }) => (
          <button
            onClick={() => row.original._id && deleteRecord(row.original._id)}
            className="button"
            disabled={isLoading}
          >
            Delete
          </button>
        ),
      },
    ],
    [records, isLoading]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: records,
    });

  // Show a message when there are no records
  if (records.length === 0) {
    return <div className="no-records">No financial records found. Add some records to get started!</div>;
  }

  return (
    <div className="table-container">
      {isLoading && <div className="loading-overlay">Processing...</div>}
      <table {...getTableProps()} className="table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} key={column.id}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} key={cell.column.id}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};