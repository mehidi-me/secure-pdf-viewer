"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import UploaderIcon from "./UploaderIcon";

function PdfUploader() {
  const router = useRouter();
  // State to track drag events and uploaded files
  const [uploadDragoverTracking, setUploadDragoverTracking] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const [uploadStatus, setUploadStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the list of uploaded files when the component mounts
    const fetchUploadedFiles = async () => {
      try {
        const response = await fetch("/api/upload"); // Endpoint to get uploaded files
        const data = await response.json();
        if (data.message) {
          console.log(data);
        } else {
          console.log(data);
          setUploadedFiles(data);
        }
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    };

    fetchUploadedFiles();
  }, []);

  const handleDelete = async (fileObj) => {
    try {
      // Make a DELETE request to the API
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: fileObj.url }), // Send the URL of the file to delete
      });

      const data = await response.json();

      if (response.ok) {
        // Remove from UI by filtering out the deleted file
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file.url !== fileObj.url)
        );
        alert("File deleted successfully");
      } else {
        alert(data.error || "Failed to delete the file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete the file");
    }
  };

  const handleUpload = async (file) => {
    setUploadStatus("");
    setLoading(true);
    if (!file) return setUploadStatus("Please select a file.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();
      if (data.error) {
        setUploadStatus(data.error);
      }
      if (data.url) {
        // Update the uploaded files list with the new file info
        setUploadedFiles((prevFiles) => [
          ...prevFiles,
          { name: file.name, url: data.url },
        ]);
      }
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  // Handle drag over event
  const onUploadDragoverEvent = (event) => {
    event.preventDefault();
    setUploadDragoverTracking(true);
    setCursorPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  // Handle drag leave event
  const onUploadDragLeaveEvent = () => {
    setUploadDragoverTracking(false);
  };

  // Handle click on "Upload a file" button
  const handleUploadClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      handleUpload(file);
    });
  };

  const onUploadDropEvent = (event) => {
    event.preventDefault();
    setUploadDragoverTracking(false);

    const files = Array.from(event.dataTransfer.files);
    files.forEach((file) => {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      handleUpload(file);
    });
  };

  return (
    <section id="app" className="bg-white min-h-[100vh]">
        <button className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => {
        // Clear localStorage and redirect to home
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        window.location.reload();
      }}>Logout</button>
      <div className="pt-10 md:py-16 lg:py-24 overflow-hidden">
        <div className="max-w-screen-xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto lg:max-w-none">
            <div className="mt-6 sm:mt-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <div className="mt-2 sm:mt-0 sm:col-span-2">
                <div
                  className="w-full flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md h-128"
                  onDragOver={onUploadDragoverEvent}
                  onDrop={onUploadDropEvent}
                  onDragLeave={onUploadDragLeaveEvent}
                >
                  {/* Circular Drag Indicator */}
                  <div
                    className={`absolute rounded-full bg-gray-100 h-20 w-20 z-10 transition-opacity duration-500 ease-in-out ${
                      uploadDragoverTracking ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      left: `calc(${cursorPosition.x}px - 2.5rem)`,
                      top: `calc(${cursorPosition.y}px - 2.5rem)`,
                    }}
                  ></div>

                  <div className="relative z-20 text-center">
                    <UploaderIcon />
                    <p className="mt-1 text-sm text-gray-600">
                      <span
                        className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                        onClick={handleUploadClick}
                      >
                        Upload a file
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF files only, up to 10MB
                    </p>
                    <input
                      type="file"
                      id="fileInput"
                      className="hidden"
                      accept="application/pdf"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>
                {loading && <p>Uploading...</p>}
              </div>
            </div>
          </div>
        </div>

        {uploadStatus && (
          <p className="mt-4 text-center text-sm text-gray-700">
            {uploadStatus}
          </p>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mt-8 max-w-screen-md mx-auto px-4">
            <h2 className="text-lg font-bold mb-4">Uploaded Files</h2>
            <ul className="space-y-4">
              {uploadedFiles
                .slice() // Create a copy to avoid mutating the original array
                .reverse()
                .map((fileObj, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border border-gray-200 p-4 rounded-lg shadow-sm"
                  >
                    <p className="text-gray-800 break-all w-[140px] md:w-[500px]">{fileObj.name}</p>
                   <div className="w-[160px]">
                   <button
                      onClick={() =>
                        router.push(window.location.origin + fileObj.url)
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        if(confirm("Are you sure you want to")){
                            handleDelete(fileObj)
                        }
                      }} // Call the delete handler
                      className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                   </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default PdfUploader;
