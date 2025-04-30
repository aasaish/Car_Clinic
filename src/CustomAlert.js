import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirmation.module.css'; // Define your CSS for the confirmation dialog

const CustomAlert = ({ message, onConfirm, onCancel, buttonLabel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p>{message}</p>
        <div className={styles.buttonContainer}>
          <button className={styles.confirmButton} onClick={async () => {
            setIsSubmitting(true);
            try {
              await onConfirm();
            } catch (error) {
              setIsSubmitting(false); // reset if something fails
            }
          }} 
          disabled={isSubmitting}
          >
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
