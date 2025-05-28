import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirmation.module.css';

const RemoveFieldModal = ({ open, onClose, onConfirm, heading, currentFields }) => {
  const [selectedField, setSelectedField] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    if (!selectedField) return;
    onConfirm(selectedField);
    setSelectedField("");
  };

  const validFields = Array.isArray(currentFields) && currentFields.length > 1
    ? currentFields
    : [];

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{heading}</h2>
        {validFields.length > 1 ? (
          <>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className={styles.input}
            >
              <option value="">Select a Field to Remove</option>
              {validFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
            <div className={styles.buttonContainer}>
              <button
                className={styles.confirmButton}
                onClick={handleConfirm}
                disabled={!selectedField}
              >
                Remove
              </button>
              <button className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p>You must have at least two specialties to remove one.</p>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default RemoveFieldModal;
