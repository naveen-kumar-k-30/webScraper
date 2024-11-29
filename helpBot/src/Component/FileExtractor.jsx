import  { useState } from "react";
import axios from "axios";
import { backEndUrl } from "../utils/BackendUrl";

// This is a mock function for the backend URL, replace with actual logic

const FileExtractor = () => {
  const [file, setFile] = useState(null); // Selected file
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [fileText, setFileText] = useState(""); // Extracted file text

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const backendUrl = await backEndUrl(); // Wait for the backend URL

      const response = await axios.post(`${backendUrl}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Pass the extracted text to the state
      setFileText(response.data.text);
    } catch (err) {
      setError("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Chatbot with Document Upload</h1>

      {/* File Upload Section */}
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Display Extracted Text */}
      <div>
        <h2>Extracted Text</h2>
        <pre>{fileText}</pre>
      </div>
    </div>
  );
};

// Export the single component
export default FileExtractor;
