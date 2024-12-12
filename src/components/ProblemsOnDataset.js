import React, { useEffect, useState } from 'react';
import './ProblemsOnDataset.css'; // Import the CSS file

const ProblemsOnDataset = ({ dataset }) => {
  const [problems, setProblems] = useState({
    missingValues: [],
    duplicateRows: [],
    outliers: [],
  });

  useEffect(() => {
    if (dataset && dataset.length > 0) {
      detectProblems(dataset);
    }
  }, [dataset]);

  const detectProblems = (data) => {
    const missingValues = checkForMissingValues(data);
    const duplicateRows = checkForDuplicateRows(data);
    const outliers = detectOutliers(data);

    setProblems({
      missingValues,
      duplicateRows,
      outliers,
    });
  };

  // Check for missing values
  const checkForMissingValues = (data) => {
    const missingRows = [];
    data.forEach((row, index) => {
      const missingColumns = Object.entries(row).filter(([key, value]) => value == null || value === '');
      if (missingColumns.length > 0) {
        missingRows.push({
          rowIndex: index + 1,
          rowData: row,
          missingColumns: missingColumns.map(([key]) => key),
        });
      }
    });
    return missingRows;
  };

  // Check for duplicate rows
  const checkForDuplicateRows = (data) => {
    const rowsMap = new Map();
    const duplicates = [];
    data.forEach((row, index) => {
      const rowString = JSON.stringify(row);
      if (rowsMap.has(rowString)) {
        rowsMap.get(rowString).push(index + 1);
      } else {
        rowsMap.set(rowString, [index + 1]);
      }
    });

    rowsMap.forEach((indexes, rowString) => {
      if (indexes.length > 1) {
        duplicates.push({
          rowIndex: indexes, // This is an array of indices
          rowData: JSON.parse(rowString),
        });
      }
    });
    return duplicates;
  };

  // Detect outliers using IQR method
// Function to preprocess extreme outliers
const preprocessExtremeOutliers = (values) => {
  const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
  return values.filter((v) => v < median * 100);
};

// Function to apply log transformation
const logTransform = (values) => {
  return values.map((v) => (v > 0 ? Math.log(v) : v));
};

// Function to calculate IQR
const calculateIQR = (values, multiplier = 3) => {
  const sorted = values.sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length / 4)];
  const q3 = sorted[Math.floor((sorted.length * 3) / 4)];
  const iqr = q3 - q1;
  return { lowerBound: q1 - multiplier * iqr, upperBound: q3 + multiplier * iqr };
};

// Main function to detect outliers
const detectOutliers = (data) => {
  const numericalColumns = Object.keys(data[0]).filter((key) => {
    const values = data.map((row) => parseFloat(row[key])).filter((value) => !isNaN(value));
    return values.length > 0 && new Set(values).size > 10 && key.toLowerCase() !== "id";
  });

  const outlierRows = [];
  numericalColumns.forEach((column) => {
    let values = data.map((row) => parseFloat(row[column])).filter((value) => !isNaN(value));

    // Preprocess extreme outliers
    values = preprocessExtremeOutliers(values);

    // Apply log transformation for skewed data
    const transformedValues = logTransform(values);

    // Calculate IQR on transformed data
    const { lowerBound, upperBound } = calculateIQR(transformedValues);

    console.log(`Column: ${column}, Lower: ${lowerBound}, Upper: ${upperBound}`);

    data.forEach((row, index) => {
      const value = parseFloat(row[column]);
      const transformedValue = Math.log(value > 0 ? value : 1); // Log transformation
      if (!isNaN(value) && (transformedValue < lowerBound || transformedValue > upperBound)) {
        outlierRows.push({
          rowIndex: index + 1,
          column: column,
          value: value,
          rowData: row,
        });
      }
    });
  });

  return outlierRows;
};

  
  const clipValues = (values, lower, upper) => {
    return values.map((value) => Math.min(Math.max(value, lower), upper));
  };
  

  return (
    <div className="problems-container">
      <h2>Problems Detected in the Dataset</h2>
  
      {/* Missing Values Table */}
      {problems.missingValues.length > 0 && (
        <div className="problem-section">
          <h3>Missing Values</h3>
          <div className="table-container"> {/* Add this container */}
            <table className="problems-table">
              <thead>
                <tr>
                  {dataset && dataset[0] && Object.keys(dataset[0]).map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problems.missingValues.map((issue, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(issue.rowData).map(([key, value], cellIndex) => (
                      <td key={cellIndex} className={value == null || value === '' ? 'missing-value' : ''}>
                        {value !== undefined && value !== null ? value : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
  
      {/* Duplicate Rows Table */}
      {problems.duplicateRows.length > 0 && (
        <div className="problem-section">
          <h3>Duplicate Rows</h3>
          <div className="table-container"> {/* Add this container */}
            <table className="problems-table">
              <thead>
                <tr>
                  {dataset && dataset[0] && Object.keys(dataset[0]).map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                  <th>Duplicate Row Indices</th>
                </tr>
              </thead>
              <tbody>
                {problems.duplicateRows.map((issue, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(issue.rowData).map(([key, value], cellIndex) => (
                      <td key={cellIndex}>{value !== undefined && value !== null ? value : 'N/A'}</td>
                    ))}
                    <td>{Array.isArray(issue.rowIndex) ? issue.rowIndex.join(', ') : issue.rowIndex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
  
      {/* Outliers Table */}
      {problems.outliers.length > 0 && (
        <div className="problem-section">
          <h3>Outliers Detected</h3>
          <div className="table-container"> {/* Add this container */}
            <table className="problems-table">
              <thead>
                <tr>
                  {dataset && dataset[0] && Object.keys(dataset[0]).map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                  <th>Outlier Details</th>
                </tr>
              </thead>
              <tbody>
                {problems.outliers.map((outlier, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(outlier.rowData).map(([key, value], cellIndex) => (
                      <td key={cellIndex}>{value !== undefined && value !== null ? value : 'N/A'}</td>
                    ))}
                    <td>
                      Outlier in column: {outlier.column}, Value: {outlier.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
  
      {problems.missingValues.length === 0 && problems.duplicateRows.length === 0 && problems.outliers.length === 0 && (
        <div>No problems detected yet. Please upload a dataset.</div>
      )}
    </div>
  );
  
};

export default ProblemsOnDataset;
