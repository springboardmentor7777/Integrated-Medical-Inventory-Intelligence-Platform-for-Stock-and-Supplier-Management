export default function DataTable({ columns, rows, emptyLabel = 'No records yet.' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium text-slate-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-800">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
