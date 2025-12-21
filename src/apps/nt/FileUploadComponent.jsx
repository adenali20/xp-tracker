import React, { useState } from "react";
import axios from "axios";

const FileUploadComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [inspectionType, setInspectionType] = useState("odometer");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle file input change
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
  };

  // Get pre-signed URL from backend
  const getPresignedUrl = async () => {
    const token = window.sessionStorage.getItem("jwtToken");
    const response = await axios.post(
      "http://dev.adenali.com:8050/api/expensesrv/generate-presigned-url",
      null,
      {
        params: {
          fileName: selectedFile.name,
          inspectionType: inspectionType,
        },
        headers: {
          Authorization: token,
        },
      }
    );

    return response.data; // { url: "...", objectKey: "..." }
  };

  // Upload using fetch
  const uploadWithFetch = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setMessage("");

    try {
      const { url, objectKey } = await getPresignedUrl();

      // Direct PUT to S3
      await fetch(url, {
        method: "PUT",
        body: selectedFile, // raw file, no headers needed
      });

      setMessage(`Upload successful (fetch)! S3 Key: ${objectKey}`);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed with fetch ❌");
    } finally {
      setIsLoading(false);
    }
  };

  // Upload using axios
  const uploadWithAxios = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setMessage("");

    try {
      const { url, objectKey } = await getPresignedUrl();

      await axios.put(url, selectedFile, {
        headers: {
          // Optional: explicitly set content-type
          "Content-Type": selectedFile.type || "application/octet-stream",
        },
      });

      setMessage(`Upload successful (axios)! S3 Key: ${objectKey}`);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed with axios ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", maxWidth: 450 }}>
      <h2>Vehicle Inspection Image Upload</h2>

      <label>
        Inspection Type:
        <select
          value={inspectionType}
          onChange={(e) => setInspectionType(e.target.value)}
          disabled={isLoading}
          style={{ marginLeft: 10 }}
        >
          <option value="odometer">Odometer</option>
          <option value="engine">Engine</option>
          <option value="truck-side">Truck Side</option>
        </select>
      </label>

      <br />
      <br />

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <br />
      <br />

      <button
        onClick={uploadWithFetch}
        disabled={isLoading || !selectedFile}
        style={{ marginRight: 10 }}
      >
        {isLoading ? "Uploading..." : "Upload with Fetch"}
      </button>

      <button
        onClick={uploadWithAxios}
        disabled={isLoading || !selectedFile}
      >
        {isLoading ? "Uploading..." : "Upload with Axios"}
      </button>

      {message && (
        <p style={{ marginTop: 15, color: message.includes("failed") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default FileUploadComponent;
