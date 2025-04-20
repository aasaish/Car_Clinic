import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirmation.module.css';


const NameModal = ({ open, onClose, onConfirm, heading ,placeholderText}) => {
  const [newName, setNewName] = useState("");
  
    if (!open) return null;
  
    const handleConfirm = () => {
      onConfirm(newName);
      setNewName("");
    };
  
    return ReactDOM.createPortal(
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h2>{heading}</h2>
          <input
            type="text"
            placeholder={placeholderText}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={styles.input}
          />
          <div className={styles.buttonContainer}>
            <button className={styles.confirmButton} onClick={handleConfirm}>
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
  
  export default NameModal;
  