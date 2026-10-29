import React from "react";
import "./table.css";
import { Flex, HStack, Tooltip, Spinner, Text } from "@chakra-ui/react";
import { Pencil, Trash2, Eye } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actionsHeader?: string;
}

function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found",
  onView,
  onEdit,
  onDelete,
  actionsHeader = "ACTIONS",
}: TableProps<T>) {
  const hasActions = Boolean(onView || onEdit || onDelete);

  return (
    <Flex className="modern-table-container">
      <table className="modern-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.accessor)} className={column.className}>
                {column.header}
              </th>
            ))}

            {hasActions && (
              <th className="text-center">{actionsHeader}</th>
            )}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                className="text-center"
                colSpan={columns.length + (hasActions ? 1 : 0)}
                style={{ padding: "40px 20px" }}
              >
                <Flex justify="center" align="center" gap={3}>
                  <Spinner size="sm" color="blue.400" />
                  <Text fontSize="sm" color="gray.400">Loading data...</Text>
                </Flex>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                className="text-center"
                colSpan={columns.length + (hasActions ? 1 : 0)}
                style={{ padding: "40px 20px", color: "#8fa0bd" }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td
                    key={String(column.accessor)}
                    className={column.className}
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.accessor as keyof T]}
                  </td>
                ))}

                {hasActions && (
                  <td className="text-center">
                    <HStack spacing={2} justify="center">
                      {onView && (
                        <Tooltip label="View Details" hasArrow>
                          <button
                            type="button"
                            className="table-action-btn view"
                            onClick={() => onView(row)}
                            aria-label="View"
                          >
                            <Eye size={17} />
                          </button>
                        </Tooltip>
                      )}

                      {onEdit && (
                        <Tooltip label="Edit" hasArrow>
                          <button
                            type="button"
                            className="table-action-btn edit"
                            onClick={() => onEdit(row)}
                            aria-label="Edit"
                          >
                            <Pencil size={17} />
                          </button>
                        </Tooltip>
                      )}

                      {onDelete && (
                        <Tooltip label="Delete" hasArrow>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            onClick={() => onDelete(row)}
                            aria-label="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </Tooltip>
                      )}
                    </HStack>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Flex>
  );
}

export default Table;