/**
 * Firebase Configuration File
 * * IMPORTANT: Replace the placeholder values below with your actual Firebase project configuration.
 * * This file sets the GlobalConfig variable on the window object, which is required by App.jsx
 * to initialize the application and authenticate the user.
 */

// Define the configuration object (Replace these with your actual values)
const firebaseConfig = {
    apiKey: "AIzaSyBfj10wMubBYdNFwDUnJGRDLfZDX_fP-4o",
    authDomain: "expense-tracker-60941.firebaseapp.com",
    projectId: "expense-tracker-60941",
    storageBucket: "expense-tracker-60941.firebasestorage.app",
    messagingSenderId: "776465310724",
    appId: "1:776465310724:web:1d4e23de847a3ebd2c8151"
};

// Define the global variables provided by the canvas environment
const __app_id = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
const __firebase_config = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : firebaseConfig;
const __initial_auth_token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;

// The main application code (App.jsx) expects to find these variables on the window object.
window.GlobalConfig = {
    // This is the configuration for Firebase initialization
    firebaseConfig: __firebase_config,
    // This is the application ID used for Firestore pathing (e.g., /artifacts/{appId}/...)
    appId: __app_id,
    // This token is used for initial custom authentication
    initialAuthToken: __initial_auth_token
};

console.log("[Config]: Global configuration set on window.GlobalConfig.");

// Exporting an empty object as a module is a common pattern to ensure the browser treats this as a module
export {};