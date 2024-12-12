import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import updated CSS

const Navbar = ({ fileUploaded, cleanedDataset }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">DataClean</Link>

      <button className="navbar-toggle" onClick={toggleMenu}>
        ☰
      </button>

      <ul className={`navbar-list ${isMobileMenuOpen ? "active" : ""}`}>
        <li className="navbar-item">
          <Link to="/" className="navbar-link">Upload File</Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/view-uploaded-dataset"
            className={`navbar-link ${!fileUploaded ? "disabled" : ""}`}
          >
            View Uploaded Dataset
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/problems-on-dataset"
            className={`navbar-link ${!fileUploaded ? "disabled" : ""}`}
          >
            Problems on Dataset
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/actions-on-dataset"
            className={`navbar-link ${!fileUploaded ? "disabled" : ""}`}
          >
            Actions on Dataset
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/view-clean-dataset"
            className={`navbar-link ${!cleanedDataset.length ? "disabled" : ""}`}
          >
            View Clean Dataset
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/visualization"
            className={`navbar-link ${!fileUploaded ? "disabled" : ""}`}
          >
            Visualization
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/download"
            className={`navbar-link ${!fileUploaded ? "disabled" : ""}`}
          >
            Download
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
