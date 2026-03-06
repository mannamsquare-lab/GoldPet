import React from 'react';
import clsx from 'clsx';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => (acc as Record<string, unknown>)?.[part], obj);
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const alignClass = (align?: string) => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx('px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', alignClass(col.align))}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx('px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', alignClass(col.align))}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="py-12 text-center text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx('px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', alignClass(col.align))}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={clsx(
                'border-b border-gray-100 transition-colors',
                onRowClick && 'cursor-pointer',
                'hover:bg-gray-50',
                rowClassName?.(row),
              )}
            >
              {columns.map((col) => {
                const value = getNestedValue(row, col.key);
                return (
                  <td
                    key={col.key}
                    className={clsx('px-4 py-3 text-sm text-gray-900', alignClass(col.align), col.className)}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.render ? col.render(value, row) : (value ?? '-')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
