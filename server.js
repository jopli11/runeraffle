const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5173;

// Check for required environment variables
const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingEnvVars);
    console.warn('Firebase functionality may not work correctly!');
}

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Log route debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Inject runtime environment variables
app.get('/env-config.js', (req, res) => {
    // Create a safe subset of environment variables to expose to the client
    const clientEnvVars = {};

    requiredEnvVars.forEach(varName => {
        if (process.env[varName]) {
            clientEnvVars[varName] = process.env[varName];
        }
    });

    res.set('Content-Type', 'application/javascript');
    res.send(`window.ENV = ${JSON.stringify(clientEnvVars)};`);
});

// For any request not for static assets, serve the index.html
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');

    // Check if index.html exists
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(500).send('Error: index.html not found in the dist directory. Make sure the build completed successfully.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`App should be available at: http://localhost:${PORT}`);
});