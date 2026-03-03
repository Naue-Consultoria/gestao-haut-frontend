import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  totalRow?: Record<string, unknown>;
}

export function DataTable({ columns, data, totalRow }: DataTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 text-left px-6 py-3.5 bg-gray-50 border-b border-gray-200 whitespace-nowrap">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors">
            {columns.map(col => (
              <td key={col.key} className="px-6 py-3.5 text-sm border-b border-gray-100 text-gray-700">
                {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
              </td>
            ))}
          </tr>
        ))}
        {totalRow && (
          <tr className="bg-gray-50 font-semibold">
            {columns.map(col => (
              <td key={col.key} className="px-6 py-3.5 text-sm text-black border-t-2 border-gray-200">
                {col.render ? col.render(totalRow[col.key], totalRow) : String(totalRow[col.key] ?? '')}
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
}
