
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PdfUploader from './components/PdfUploader';

const ProtectedPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if credentials are valid (you can change this to match your own credentials)
    const validUsername = "admin";
    const validPassword = "PDFviewerleadgen2$x";
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");

    // Check if credentials are already in localStorage
    if (storedUsername === validUsername && storedPassword === validPassword) {
      setAuthenticated(true); // If credentials exist, set authenticated state
      return;
    }
    // Prompt the user for username and password when the page loads
    const username = prompt("Enter your username:");
    const password = prompt("Enter your password:");

    

    if (username === validUsername && password === validPassword) {
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      setAuthenticated(true); // Allow access if credentials are correct
    } else {
      alert("Invalid credentials!");
    }
  }, []);

  if (!authenticated) {
    return <div>Loading...</div>; // Show a loading message while waiting for authentication
  }

  return (
    <PdfUploader />
  );
};

export default ProtectedPage;
