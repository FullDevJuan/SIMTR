import React, { useState } from 'react';
import styles from './Table.module.css';

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  itemsPerPage?: number;
}

export const Table: React.FC<TableProps> = ({ columns, data, itemsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const isPaginated = itemsPerPage && itemsPerPage > 0;
  const totalPages = isPaginated ? Math.ceil(data.length / itemsPerPage) : 1;
  
  const currentData = isPaginated
    ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : data;

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

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
          {currentData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.td} style={{ textAlign: 'center' }}>
                No hay datos disponibles.
              </td>
            </tr>
          ) : (
            currentData.map((row, i) => (
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

      {isPaginated && totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn} 
            onClick={handlePrev} 
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {currentPage} de {totalPages}
          </span>
          <button 
            className={styles.pageBtn} 
            onClick={handleNext} 
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
