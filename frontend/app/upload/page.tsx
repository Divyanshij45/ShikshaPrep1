'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showStartButton, setShowStartButton] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setShowStartButton(true);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleStartTest = () => {
    // Later: send file to backend and navigate to test page
    alert('Starting test...');
    // Example: router.push('/dashboard');
  };

  return (
    <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Upload Your Question Paper</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="mb-4 w-full max-w-xs sm:max-w-md px-3 py-2 border rounded"
      />

      {showStartButton && (
        <button
          onClick={handleStartTest}
          className="mt-4 sm:mt-0 sm:ml-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          Start Test
        </button>
      )}
    </div>
  );
}
