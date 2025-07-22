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
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold mb-6">Upload Your Question Paper</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="mb-4"
      />

      {showStartButton && (
        <button
          onClick={handleStartTest}
          className="ml-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
        >
          Start Test
        </button>
      )}
    </div>
  );
}
