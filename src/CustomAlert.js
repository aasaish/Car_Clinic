import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirmation.module.css'; // Define your CSS for the confirmation dialog

const CustomAlert = ({ message, onConfirm, onCancel, buttonLabel }) => {
  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p>{message}</p>
        <div className={styles.buttonContainer}>
          <button className={styles.confirmButton} onClick={onConfirm}>
            {buttonLabel}
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') // Use a portal to render outside current component hierarchy
  );
};

export default CustomAlert;
