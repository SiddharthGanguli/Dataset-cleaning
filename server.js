// Backend - Express server (server.js)

const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');

const app = express();
const port = 5000;

// Enable CORS (if you're accessing from a different domain)
app.use(cors());

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Save files to the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Test route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Function to detect problems in dataset
function detectIssues(dataset) {
  const issues = {
    missingValues: [],
    invalidValues: [],
    outliers: [],
    duplicates: []
  };

  const seenEmails = new Set();

  dataset.forEach((row, index) => {
    // Check for missing values
    for (const key in row) {
      if (!row[key] || row[key].trim() === '') {
        issues.missingValues.push({ row: index + 1, column: key, value: row[key] });
      }
    }

    // Check for invalid values (e.g., email format, numeric ranges)
    if (row.email && !row.email.includes('@')) {
      issues.invalidValues.push({ row: index + 1, column: 'email', value: row.email });
    }
    if (row.math_score && (isNaN(row.math_score) || row.math_score < 0 || row.math_score > 100)) {
      issues.invalidValues.push({ row: index + 1, column: 'math_score', value: row.math_score });
    }

    // Check for outliers (e.g., too high self-study hours)
    if (row.weekly_self_study_hours && row.weekly_self_study_hours > 80) {
      issues.outliers.push({ row: index + 1, column: 'weekly_self_study_hours', value: row.weekly_self_study_hours });
    }

    // Check for duplicates (e.g., same email address)
    if (row.email && seenEmails.has(row.email)) {
      issues.duplicates.push({ row: index + 1, column: 'email', value: row.email });
    } else if (row.email) {
      seenEmails.add(row.email);
    }
  });

  return issues;
}

// Problem detection route
app.post('/detect-issues', (req, res) => {
  const dataset = req.body; // Expecting the dataset to be sent in the request body

  if (!dataset || dataset.length === 0) {
    return res.status(400).send({ message: 'No dataset provided or dataset is empty' });
  }

  try {
    const issues = detectIssues(dataset);
    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error detecting issues in the dataset' });
  }
});

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  // Process CSV files
  if (fileExtension === '.csv') {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => rows.push(row))
      .on('end', () => {
        if (rows.length > 0) {
          res.send(rows); // Send the parsed rows as the response
        } else {
          res.status(400).send({ message: 'No data found in the uploaded file.' });
        }
      })
      .on('error', (error) => {
        console.error(error);
        res.status(500).send({ message: 'Error processing the file' });
      });
  } 
  // Process Excel files
  else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      if (data.length > 0) {
        res.send(data); // Send the parsed data as the response
      } else {
        res.status(400).send({ message: 'No data found in the uploaded file.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error processing the file' });
    }
  } else {
    res.status(400).send({ message: 'Unsupported file format. Please upload a CSV or Excel file.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
