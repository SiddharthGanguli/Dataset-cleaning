import React, { useState, useEffect } from 'react';
import './ActionsOnDataset.css'; // Import the CSS file

const ActionsOnDataset = ({ dataset, onCleanDataset }) => {
  const [fillMethod, setFillMethod] = useState('mean');
  const [customValue, setCustomValue] = useState('');
  const [removeEmptyRows, setRemoveEmptyRows] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]); // Multi-selection for columns
  const [previewDataset, setPreviewDataset] = useState([]);
  const [columnsWithMissingValues, setColumnsWithMissingValues] = useState({ numeric: [], categorical: [] });
  const [userAddedColumn, setUserAddedColumn] = useState('');

  // Get the columns with missing values and their types
  useEffect(() => {
    const missingColumns = getColumnsWithMissingValues(dataset);
    setColumnsWithMissingValues(missingColumns);
  }, [dataset]);

  const getColumnsWithMissingValues = (dataset) => {
    const columnsWithMissing = {
      numeric: [],
      categorical: [],
    };

    if (dataset.length === 0) return columnsWithMissing;

    const columns = Object.keys(dataset[0]);

    columns.forEach((column) => {
      const hasMissing = dataset.some((row) => row[column] === null || row[column] === '');
      if (hasMissing) {
        const isNumeric = dataset.every((row) => !isNaN(row[column]));
        if (isNumeric) {
          columnsWithMissing.numeric.push(column);
        } else {
          columnsWithMissing.categorical.push(column);
        }
      }
    });

    return columnsWithMissing;
  };

  // Calculate Mean for numeric data
  const calculateMean = (dataset, column) => {
    const values = dataset.map((row) => parseFloat(row[column])).filter((value) => !isNaN(value));
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  };

  // Calculate Median for numeric data
  const calculateMedian = (dataset, column) => {
    const values = dataset.map((row) => parseFloat(row[column])).filter((value) => !isNaN(value));
    values.sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    return values.length % 2 === 0 ? (values[middle - 1] + values[middle]) / 2 : values[middle];
  };

  // Forward fill function
  const forwardFill = (dataset, column) => {
    let lastValidValue = null;
    let firstValidValue = dataset.find((row) => row[column] !== null && row[column] !== '');
    firstValidValue = firstValidValue ? firstValidValue[column] : null;

    const newDataset = [...dataset]; // Clone the dataset to avoid mutation

    for (let i = 0; i < newDataset.length; i++) {
      const row = newDataset[i];
      if (row[column] !== null && row[column] !== '') {
        lastValidValue = row[column]; // Update last valid value when found
      } else {
        newDataset[i][column] = lastValidValue !== null ? lastValidValue : firstValidValue; // Use the first valid value if no previous value exists
      }
    }
    return newDataset;
  };

  // Backward fill function
  const backwardFill = (dataset, column) => {
    let lastValidValue = null;
    const newDataset = [...dataset]; // Clone the dataset to avoid mutation

    for (let i = newDataset.length - 1; i >= 0; i--) {
      const row = newDataset[i];
      if (row[column] !== null && row[column] !== '') {
        lastValidValue = row[column]; // Update last valid value when found
      } else if (lastValidValue !== null) {
        newDataset[i][column] = lastValidValue; // Replace missing value with the next valid value
      }
    }
    return newDataset;
  };

  // Fill missing values function for multiple columns
  const fillMissingValues = (dataset, method, columns) => {
    let cleanedDataset = [...dataset];

    columns.forEach((column) => {
      if (method === 'mean') {
        cleanedDataset = cleanedDataset.map((row) => {
          const filledRow = { ...row };
          if (row[column] === null || row[column] === undefined) {
            const columnValues = dataset
              .map((item) => item[column])
              .filter((value) => value !== null && value !== undefined);
            const meanValue = columnValues.reduce((acc, value) => acc + value, 0) / columnValues.length;
            filledRow[column] = meanValue;
          }
          return filledRow;
        });
      } else if (method === 'median') {
        cleanedDataset = cleanedDataset.map((row) => {
          const filledRow = { ...row };
          if (row[column] === null || row[column] === undefined) {
            const medianValue = calculateMedian(dataset, column);
            filledRow[column] = medianValue;
          }
          return filledRow;
        });
      } else if (method === 'forwardFill') {
        cleanedDataset = forwardFill(cleanedDataset, column);
      } else if (method === 'backwardFill') {
        cleanedDataset = backwardFill(cleanedDataset, column);
      }
    });

    return cleanedDataset;
  };

  // Handle apply button click to clean the dataset
  const handleApplyFillMethod = () => {
    let cleaned = [...dataset]; // Start with a copy of the original dataset

    // Apply the selected fill method to multiple selected columns
    if (fillMethod === 'mean' || fillMethod === 'median' || fillMethod === 'forwardFill' || fillMethod === 'backwardFill') {
      cleaned = fillMissingValues(cleaned, fillMethod, selectedColumns);
    }

    // Optionally remove empty rows if the checkbox is checked
    if (removeEmptyRows) {
      cleaned = removeRowsWithEmptyValues(cleaned);
    }

    setPreviewDataset(cleaned); // Update preview with cleaned data
    onCleanDataset(cleaned); // Pass cleaned data to the parent
  };

  // Remove rows with empty or null values
  const removeRowsWithEmptyValues = (dataset) => {
    return dataset.filter((row) => {
      return Object.values(row).every((value) => value !== null && value !== '');
    });
  };

  // Handle user adding a new column
  const handleAddColumn = () => {
    if (userAddedColumn && !columnsWithMissingValues.categorical.includes(userAddedColumn) && !columnsWithMissingValues.numeric.includes(userAddedColumn)) {
      setColumnsWithMissingValues((prev) => ({
        ...prev,
        categorical: [...prev.categorical, userAddedColumn],
      }));
    }
  };

  // Get columns dynamically (assume the first row contains headers)
  const columns = dataset.length ? Object.keys(dataset[0]) : [];

  return (
    <div className="dataset-cleaning-container">
      <h1>Actions on Dataset</h1>

      {/* Instructions/Clarifications for the user */}
      <div className="recommendation-container">
        <h3>How to handle missing values:</h3>
        <p><strong>Numeric Data:</strong> For numeric columns, you can use the mean, median, or custom values to fill missing values.</p>
        <p><strong>Categorical Data:</strong> For categorical columns, the mode (most frequent value) or a custom value is often used to fill missing values.</p>
        <p><strong>Advanced Options:</strong> You can also use forward fill (carry forward the last valid value) or backward fill (use the next available value).</p>
        <p><strong>Removing Empty Rows:</strong> You can choose to remove rows that contain any missing or empty values.</p>
      </div>

      {/* Filling missing values */}
      <div className="input-container">
        <h3>Select how to handle missing values:</h3>
        <div className="input-section">
          <label>
            Fill Method:
            <select value={fillMethod} onChange={(e) => setFillMethod(e.target.value)}>
              <option value="mean">Fill with Mean (Numeric Data)</option>
              <option value="median">Fill with Median (Numeric Data)</option>
              <option value="mode">Fill with Mode (Categorical Data)</option>
              <option value="custom">Fill with Custom Value</option>
              <option value="forwardFill">Forward Fill (Carry forward previous value)</option>
              <option value="backwardFill">Backward Fill (Use next valid value)</option>
            </select>
          </label>
          <p className="help-text">Select the method you would like to use to fill missing values in the dataset.</p>
        </div>

        {/* Multi-selection dropdown for columns */}
        <div className="column-selection">
          <label>
            Select Columns for Fill:
            <select
              multiple
              value={selectedColumns}
              onChange={(e) =>
                setSelectedColumns(Array.from(e.target.selectedOptions, (option) => option.value))
              }
            >
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Option to remove empty rows */}
        <div className="remove-empty-rows">
          <label>
            <input
              type="checkbox"
              checked={removeEmptyRows}
              onChange={(e) => setRemoveEmptyRows(e.target.checked)}
            />
            Remove empty rows (rows with null or empty values)
          </label>
        </div>

        {/* Apply button */}
        <button onClick={handleApplyFillMethod}>Apply</button>
      </div>

      {/* Preview */}
      {previewDataset.length > 0 && (
        <div className="dataset-preview">
          <h3>Preview of Cleaned Dataset:</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(previewDataset[0]).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewDataset.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default ActionsOnDataset;