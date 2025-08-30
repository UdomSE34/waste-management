export default function DataTable({ columns, rows }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
  {rows.length > 0 ? (
    rows.map((row, i) => (
      <tr key={i} className={row.rowClassName || ""}>
        {columns.map((col) => (
          <td key={col}>{row[col] || ""}</td>
        ))}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={columns.length}>No data available</td>
    </tr>
  )}
</tbody>

    </table>
  );
}
