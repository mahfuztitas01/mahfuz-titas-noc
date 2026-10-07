import { classes } from '../utils/format'
import { Spinner } from './EmptyState'

export default function DataTable({
  columns,
  data,
  loading = false,
  emptyText = 'No records found',
  rowKey = (r) => r.id,
  onRowClick,
  dense = false,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Spinner /> Loading…
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">{emptyText}</div>
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-noc-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={classes(
                  'whitespace-nowrap px-3 font-medium text-slate-500 dark:text-slate-400',
                  dense ? 'py-2' : 'py-3',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={classes(
                'border-b border-slate-100 transition-colors last:border-0 dark:border-noc-border/60',
                onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-noc-panel2'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={classes(
                    'px-3 text-slate-700 dark:text-slate-200',
                    dense ? 'py-2' : 'py-3',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center'
                  )}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
