import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirmation.module.css';


const PasswordModal = ({ open, onClose, onConfirm, heading }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    if (!open) return null;

    const handleConfirm = () => {
        onConfirm(currentPassword,newPassword);
        setNewPassword("");
        setCurrentPassword("");
    };

    return ReactDOM.createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>{heading}</h2>
                <input
                    type="text"
                    placeholder="Enter Current Password:"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.input}
                />
                <input
                    type="text"
                    placeholder="Enter New Password:"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

export default PasswordModal;
