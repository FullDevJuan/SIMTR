import React from 'react';
import styles from './Table.module.css';

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
}

export const Table: React.FC<TableProps> = ({ columns, data }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.td} style={{ textAlign: 'center' }}>
                No hay datos disponibles.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} className={styles.tr}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
