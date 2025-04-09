import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Confirmation.module.css'; // Define your CSS for the confirmation dialog

const ShowDetails = ({ appointment, onConfirm }) => {
    return ReactDOM.createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>Appointment Details</h2>
                <div className={styles.detailRow}><strong>AppointmentID:</strong> {appointment.aid}</div>
                <div className={styles.detailRow}><strong>Name:</strong> {appointment.name}</div>
                <div className={styles.detailRow}><strong>Email:</strong> {appointment.email}</div>
                <div className={styles.detailRow}><strong>Mobile:</strong> {appointment.mobile}</div>
                <div className={styles.detailRow}><strong>Address:</strong> {appointment.address}</div>
                <div className={styles.detailRow}><strong>Query:</strong> {appointment.query}</div>
                <div className={styles.detailRow}><strong>Car Model:</strong> {appointment.carModel}</div>
                <div className={styles.detailRow}><strong>Car Number Plate:</strong> {appointment.carNumberPlate}</div>
                <div className={styles.detailRow}><strong>Status:</strong> {appointment.status}</div>
                <div className={styles.detailRow}><strong>Visit Preference:</strong> {appointment.visitPreference}</div>
                <div className={styles.detailRow}><strong>Selected Service:</strong> {appointment.selectedServices}</div>
                <div className={styles.detailRow}><strong>Mechanic Name:</strong> {appointment.mechanicName}</div>
                <div className={styles.detailRow}><strong>Mechanic Email:</strong> {appointment.mechanicEmail}</div>
                <div className={styles.detailRow}>
                    <strong>Rating:</strong>{" "}
                    {appointment.rating ? (
                        [...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: i < appointment.rating ? '#FFD700' : '#ccc' }}>★</span>
                        ))
                    ) : (
                        'Not yet rated'
                    )}
                </div>

                <div className={styles.buttonContainer}>
                    <button className={styles.confirmButton} onClick={onConfirm}>
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default ShowDetails;
