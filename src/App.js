import React, { useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Page Components
import ViewDataset from './components/ViewDataset';
import ProblemsOnDataset from './components/ProblemsOnDataset';
import ViewCleanDataset from './components/ViewCleanDataset';
import Visualization from './components/Visualization';
import Download from './components/Download';
import ActionsOnDataset from './components/ActionsOnDataset';
import Navbar from './Navbar'; // Import the Navbar component

function App() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [file, setFile] = useState(null);
  const [serverStatus, setServerStatus] = useState(true);
  const [dataset, setDataset] = useState([]);
  const [cleanedDataset, setCleanedDataset] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const checkServerStatus = async () => {
    try {
      await axios.get('http://localhost:5000');
      setServerStatus(true);
    } catch (error) {
      console.error('Server is not running:', error);
      setServerStatus(false);
    }
  };

  const handleFileUpload = async (event) => {
    const newFile = event.target.files[0];
    if (newFile) {
      setFile(newFile);
      setFileUploaded(false); // Reset until upload is complete
      await checkServerStatus();

      if (!serverStatus) {
        alert('Server is not running. Please start the server first.');
        return;
      }

      const formData = new FormData();
      formData.append('file', newFile);

      try {
        const response = await axios.post('http://localhost:5000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data && response.data.length > 0) {
          setDataset(response.data); // Store dataset
          setFileUploaded(true);
        } else {
          alert('No data found in the uploaded file.');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('An error occurred while uploading the file. Please try again.');
      }
    }
  };

  const handleResetFileUpload = () => {
    setFileUploaded(false);
    setFile(null);
    setDataset([]);
    setCleanedDataset([]);
  };

  // Handle the cleaning actions from ActionsOnDataset component
  const handleCleanDataset = (cleanedData) => {
    setCleanedDataset(cleanedData);
    navigate('/view-clean-dataset');
  };

  return (
    <div className="app-container">
      {/* Use Navbar component */}
      <Navbar fileUploaded={fileUploaded} cleanedDataset={cleanedDataset} />

      {/* File upload section */}
      {location.pathname === '/' && (
        <div className="upload-section">
          {!fileUploaded ? (
            <>
              <h2>Please upload a dataset to continue</h2>
              <input type="file" onChange={handleFileUpload} />
            </>
          ) : (
            <div className="uploaded-file">
              <h3>File Uploaded: {file.name}</h3>
              <button className="upload-new-file-btn" onClick={handleResetFileUpload}>Upload New File</button>
            </div>
          )}
        </div>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<div>{!fileUploaded ? 'Upload your file to start.' : 'File uploaded successfully.'}</div>} />
        <Route path="/view-uploaded-dataset" element={fileUploaded ? <ViewDataset dataset={dataset} /> : <div>Please upload a file first.</div>} />
        <Route path="/problems-on-dataset" element={fileUploaded ? <ProblemsOnDataset dataset={dataset} /> : <div>Please upload a file first.</div>} />
        <Route
          path="/actions-on-dataset"
          element={fileUploaded ? <ActionsOnDataset dataset={dataset} onCleanDataset={handleCleanDataset} /> : <div>Please upload a file first.</div>}
        />
        <Route
          path="/view-clean-dataset"
          element={cleanedDataset.length ? <ViewCleanDataset dataset={cleanedDataset} /> : <div>No cleaned data available.</div>}
        />
        <Route path="/visualization" element={<Visualization />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </div>
  );
}

export default App;
