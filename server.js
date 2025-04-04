const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5173;

// Enable CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Enable extended debugging in production
const DEBUG = process.env.DEBUG === 'true';

// Check for required environment variables
const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
];

console.log('Checking environment variables...');
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingEnvVars);
    console.warn('Firebase functionality may not work correctly!');
} else {
    console.log('✓ All required environment variables are set');
    if (DEBUG) {
        console.log('Firebase Config:');
        requiredEnvVars.forEach(varName => {
                    const value = process.env[varName];
                    console.log(`- ${varName}: ${value ? `${value.substring(0, 3)}...${value.substring(value.length - 3)}` : 'undefined'}`);
    });
  }
}

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('CRITICAL ERROR: dist directory not found at', distPath);
  console.error('Current directory contents:', fs.readdirSync(__dirname));
} else {
  console.log('Found dist directory at', distPath);
  console.log('dist directory contents:', fs.readdirSync(distPath));
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
  
  // Get all VITE_ prefixed environment variables
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      clientEnvVars[key] = process.env[key];
    }
  });
  
  // For debugging, log the available variables (without values for security)
  if (DEBUG) {
    console.log(`Serving environment variables: ${Object.keys(clientEnvVars).join(', ')}`);
    console.log(`Environment variables count: ${Object.keys(clientEnvVars).length}`);
  }
  
  res.set('Content-Type', 'application/javascript');
  res.send(`window.ENV = ${JSON.stringify(clientEnvVars)};`);
});

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is working', 
    env: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// For any request not for static assets, serve the index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    console.log(`Serving index.html for path: ${req.path}`);
    res.sendFile(indexPath);
  } else {
    console.error('Error: index.html not found in the dist directory');
    res.status(500).send(`
      <html>
        <head><title>Server Error</title></head>
        <body>
          <h1>Server Error</h1>
          <p>The application failed to start properly.</p>
          <h2>Missing Files</h2>
          <p>index.html not found in the dist directory. Build may have failed.</p>
          <h2>Environment</h2>
          <p>NODE_ENV: ${process.env.NODE_ENV}</p>
          <p>Available env vars: ${Object.keys(process.env).filter(key => key.startsWith('VITE_')).join(', ')}</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`App should be available at: http://localhost:${PORT}`);
  
  // List the contents of the dist directory
  try {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      console.log('Contents of dist directory:');
      const files = fs.readdirSync(distPath);
      files.forEach(file => {
        console.log(`- ${file}`);
      });
    } else {
      console.error('dist directory not found!');
    }
  } catch (error) {
    console.error('Error listing dist directory:', error);
  }
});