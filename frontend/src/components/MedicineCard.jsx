import React from 'react';



const MedicineCard = ({ medicine }) => {
  const confidencePercentage = Math.round((medicine.confidence || 0) * 100);

  return (
    <div className="card">
      <h4>{medicine.name}</h4>
      <div className="mb-2">
        Confidence: {confidencePercentage}%
        <div className="progress">
          <div className="progress-bar" style={{ width: `${confidencePercentage}%` }}></div>
        </div>
      </div>
      <p><strong>Description:</strong> {medicine.description}</p>
      <p><strong>Uses:</strong> {medicine.uses}</p>
      <p><strong>Dosage:</strong> {medicine.dosage}</p>
    </div>
  );
};

export default MedicineCard;
