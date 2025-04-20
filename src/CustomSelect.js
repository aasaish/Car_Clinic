import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirmation.module.css';


const SelectModal = ({ open, onClose, onConfirm, heading, currentField }) => {
    const [newField, setNewField] = useState("");

    if (!open) return null;

    const handleConfirm = () => {
        onConfirm(newField);
        setNewField("");
    };

    const options = ["Mechanic", "Electrician", "Dentor", "Painter"].filter(
        (field) => !Array.isArray(currentField)
          ? field !== currentField
          : !currentField.includes(field)
      );
      

    return ReactDOM.createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>{heading}</h2>
                <select
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    className={styles.input}
                >
                    <option value="">Select a Service</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <div className={styles.buttonContainer}>
                    <button className={styles.confirmButton} onClick={handleConfirm} disabled={!newField}>
                        OK
                    </button>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default SelectModal;
