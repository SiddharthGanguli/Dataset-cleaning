import React, { useMemo } from 'react';
import { useTable } from 'react-table';
import './ViewDataset.css'; // Import CSS for styling

const ViewDataset = ({ dataset }) => {
  const columns = useMemo(
    () =>
      dataset && dataset.length > 0
        ? Object.keys(dataset[0]).map((key) => ({
            Header: key,
            accessor: key,
          }))
        : [],
    [dataset]
  );

  const data = useMemo(() => dataset, [dataset]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  if (!dataset || dataset.length === 0) {
    return <div className="no-data">No data available to display.</div>;
  }

  return (
    <div className="table-container">
      <table {...getTableProps()} className="styled-table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ViewDataset;
