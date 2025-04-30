import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirmation.module.css';

const SelectTwoModal = ({ open, onClose, onConfirm, heading, currentField }) => {
    const [fromField, setFromField] = useState("");
    const [toField, setToField] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);


    if (!open) return null;

    const handleConfirm = () => {
        setIsSubmitting(true);
        onConfirm(fromField, toField);
        setFromField("");
        setToField("");
    };

    const allFields = ["Mechanic", "Electrician", "Dentor", "Painter"];

    const currentSpecialties = Array.isArray(currentField) ? currentField : [currentField];
    const availableFields = allFields.filter((field) => !currentSpecialties.includes(field));

    return ReactDOM.createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>{heading}</h2>

                <label className={styles.label}>Select current field to replace:</label>
                <select
                    value={fromField}
                    onChange={(e) => setFromField(e.target.value)}
                    className={styles.input}
                >
                    <option value="">-- Select Your Current Field --</option>
                    {currentSpecialties.map((field) => (
                        <option key={field} value={field}>
                            {field}
                        </option>
                    ))}
                </select>
                <br />
                <label className={styles.label}>Select new field to add:</label>
                <select
                    value={toField}
                    onChange={(e) => setToField(e.target.value)}
                    className={styles.input}
                >
                    <option value="">-- Select New Field --</option>
                    {availableFields.map((field) => (
                        <option key={field} value={field}>
                            {field}
                        </option>
                    ))}
                </select>

                <div className={styles.buttonContainer}>
                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                        disabled={!fromField || !toField || isSubmitting}
                    >
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

export default SelectTwoModal;
