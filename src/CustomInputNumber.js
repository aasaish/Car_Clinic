import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirmation.module.css';
import CustomAlert from './CustomAlert';


const ExModal = ({ open, onClose, onConfirm, heading }) => {
    const [newExperience, setExperience] = useState("");
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        onConfirm: () => { },
    });

      const showAlert = (message, onConfirm) => {
    setAlert({ show: true, message, onConfirm });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ show: false, message: '', onConfirm: () => { } });
  };

    if (!open) return null;

    const handleConfirm = () => {
        if (!/^\d{0,2}$/.test(newExperience)) {
            showAlert("Experience must be in years.");
            return;
        }
        onConfirm(newExperience);
        setExperience("");
    };

    return ReactDOM.createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>{heading}</h2>
                <input type="text" value={newExperience} 
                  onChange={(e) => {
                      const value = e.target.value;
                      // Allow only digits and limit to 11 characters
                      if (/^\d{0,2}$/.test(value)) {
                        setExperience(value);
                      }
                    }}
                    inputMode="numeric"  minLength="1" title="Please Enter Experince in years"
                  required />
                <div className={styles.buttonContainer}>
                    <button className={styles.confirmButton} onClick={handleConfirm} >
                        OK
                    </button>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
            {alert.show && (
                <CustomAlert
                    message={alert.message}
                    onConfirm={() => {
                        if (typeof alert.onConfirm === "function") {
                            alert.onConfirm(); // Execute the stored function
                        }
                        closeAlert(); // Close alert after confirmation
                    }}
                    onCancel={closeAlert}
                    buttonLabel="OK"
                />
            )}
        </div>,
        document.getElementById('modal-root')
    );
};

export default ExModal;
