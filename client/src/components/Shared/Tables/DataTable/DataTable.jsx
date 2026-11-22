import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import Input from '@/components/Shared/Form/Input/Input';
import EmptyState from '@/components/Shared/Feedback/EmptyState/EmptyState';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import './DataTable.scss';

export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search...',
  onRowClick,
  isLoading = false,
  emptyMessage = 'No records found',
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter by search term across all visible column keys
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col.key];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        })
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, columns, searchTerm, sortKey, sortDirection]);

  return (
    <div className={`data-table-container ${className}`}>
      {searchPlaceholder && (
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search className="data-table-search__icon" size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="data-table-search__input"
            />
          </div>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`data-table__th ${col.sortable ? 'data-table__th--sortable' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="data-table__th-content">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="data-table__sort-icon">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )
                        ) : (
                          <ArrowUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="data-table__loading-cell">
                  <Spinner size="md" />
                </td>
              </tr>
            ) : filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty-cell">
                  <EmptyState title={emptyMessage} description="No matching entries to display." />
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((row, index) => (
                <tr
                  key={row._id || row.id || index}
                  className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="data-table__td">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
