import React, { useState } from 'react';
import MedicineCard from '../components/MedicineCard';



const PrescriptionUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PNG, JPG, JPEG allowed.');
        return;
      }
      if (file.size > 16 * 1024 * 1024) {
        setError('Max size is 16MB.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    setMedicines([]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('http://localhost:5000/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMedicines(data.medicines || []);
        setSuccessMessage(data.message || 'Medicines found!');
      } else {
        setError(data.message || 'Error extracting medicines.');
      }
    } catch {
      setError('Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setMedicines([]);
    setError(null);
    setSuccessMessage('');
    document.getElementById('prescription-file').value = '';
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Prescription Upload</h1>

      <div className="card mb-4">
        <h3 className="mb-3">Upload Prescription</h3>
        <input
          type="file"
          id="prescription-file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="form-control mb-2"
          disabled={isLoading}
        />
        <button onClick={handleSubmit} className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Extract Medicines'}
        </button>
        {selectedFile && (
          <p className="text-muted mt-2">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {medicines.length > 0 && (
        <div>
          <h3 className="mb-3">Extracted Medicines</h3>
          <div className="grid gap-3">
            {medicines.map((medicine, i) => (
              <MedicineCard key={i} medicine={medicine} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionUpload;
