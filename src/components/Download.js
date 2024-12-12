import React from 'react';

const Download = ({ cleanedDataset }) => {
  const handleDownload = () => {
    // Convert dataset to CSV
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(cleanedDataset[0]).join(','), // Headers
        ...cleanedDataset.map((row) =>
          Object.values(row)
            .map((value) => `"${value}"`) // Handle commas in values
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'cleaned_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1>Download Cleaned Dataset</h1>
      {cleanedDataset && cleanedDataset.length > 0 ? (
        <button onClick={handleDownload}>Download CSV</button>
      ) : (
        <p>Download facility are not available right now</p>
      )}
    </div>
  );
};

export default Download;
