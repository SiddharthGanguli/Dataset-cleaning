import React from 'react';
import './ViewCleanDataset.css';

const ViewCleanDataset = ({ dataset }) => {
  return (
    <div className="view-clean-dataset-container">
      <h1 className="dataset-title">Cleaned Dataset</h1>
      
      {/* Displaying the cleaned dataset */}
      {dataset.length === 0 ? (
        <p>No data to display.</p>
      ) : (
        <table className="dataset-table">
          <thead>
            <tr>
              {Object.keys(dataset[0]).map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
  {dataset.map((row, rowIndex) => (
    <tr key={rowIndex}>
      {Object.entries(row).map(([key, value], cellIndex) => (
        <td key={cellIndex} data-label={key}>
          {value}
        </td>
      ))}
    </tr>
  ))}
</tbody>

        </table>
      )}
    </div>
  );
};

export default ViewCleanDataset;
