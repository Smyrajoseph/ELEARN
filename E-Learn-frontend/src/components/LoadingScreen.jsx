import React from 'react';
import pandaImage from '../assets/sleeping_panda.png';
import '../App.css'; // Ensure we have access to global styles/keyframes

const LoadingScreen = () => {
    return (
        <div style={styles.container}>
            <div className="breathing-animation">
                <img
                    src={pandaImage}
                    alt="Loading..."
                    style={styles.image}
                />
            </div>
            <h2 style={styles.text}>Loading E-LEARN...</h2>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFDD0', // Cream background
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
    },
    image: {
        maxWidth: '300px',
        width: '80%',
        height: 'auto',
        borderRadius: '20px', // Optional: rounded corners for the image
    },
    text: {
        marginTop: '20px',
        color: '#006D5B', // Teal Green
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        animation: 'pulse 2s infinite ease-in-out'
    }
};

export default LoadingScreen;
