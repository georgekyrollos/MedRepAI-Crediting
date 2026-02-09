import { forwardRef, useState, useMemo, type HTMLAttributes } from 'react'
import styles from './Table.module.css'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  width?: string
}

interface TableProps<T> extends HTMLAttributes<HTMLTableElement> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  onRowClick?: (item: T) => void
  emptyMessage?: string
  highlightRow?: (item: T) => 'danger' | 'warning' | null
}

type SortDirection = 'asc' | 'desc' | null

export function Table<T>({
  columns,
  data,
  keyField,
  onRowClick,
  emptyMessage = 'No data available',
  highlightRow,
  className,
  ...props
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data

    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortKey, sortDirection])

  return (
    <div className={styles.wrapper}>
      <table className={`${styles.table} ${className || ''}`} {...props}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${styles.th} ${column.sortable ? styles.sortable : ''}`}
                style={{ width: column.width }}
                onClick={() => handleSort(column.key, column.sortable)}
              >
                <div className={styles.headerContent}>
                  {column.header}
                  {column.sortable && (
                    <span className={styles.sortIcon}>
                      {sortKey === column.key && sortDirection === 'asc' && '↑'}
                      {sortKey === column.key && sortDirection === 'desc' && '↓'}
                      {sortKey !== column.key && '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item) => {
              const highlight = highlightRow?.(item)
              const itemRecord = item as Record<string, unknown>
              return (
                <tr
                  key={String(itemRecord[keyField as string])}
                  className={`${styles.tr} ${onRowClick ? styles.clickable : ''} ${
                    highlight ? styles[highlight] : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={styles.td}>
                      {column.render
                        ? column.render(item)
                        : (itemRecord[column.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  ({ currentPage, totalPages, onPageChange }, ref) => {
    if (totalPages <= 1) return null

    return (
      <div ref={ref} className={styles.pagination}>
        <button
          className={styles.pageButton}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className={styles.pageButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    )
  }
)

Pagination.displayName = 'Pagination'
