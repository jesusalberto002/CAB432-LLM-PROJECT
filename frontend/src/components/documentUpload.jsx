// frontend/src/DocumentUpload.jsx
import React from 'react';

function DocumentUpload({ onFileSelect }) {
  
    const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <>
      <input
        type="file"
        id="file-input"
        onChange={handleFileChange}
        style={{ display: 'none' }} // Hide the default input
      />
      <label htmlFor="file-input" className="file-upload-button">
        {/* Simple SVG for a file icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
        </svg>
      </label>
    </>
  );
}

export default DocumentUpload;