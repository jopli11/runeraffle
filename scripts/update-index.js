const fs = require('fs');
const path = require('path');

// Path to the dist directory
const distPath = path.join(__dirname, '..', 'dist');

console.log('Updating index.html for production...');

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(__dirname, '..');
if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log('Created scripts directory');
}

// Find the main JavaScript file in the assets directory
const assetsPath = path.join(distPath, 'assets');
let mainJsFile = null;
let mainCssFile = null;

if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);

    // Find the main JS file - typically starts with 'main-' and ends with '.js'
    mainJsFile = files.find(file => file.match(/main-.*\.js$/));
    // Find the main CSS file - typically starts with 'main-' and ends with '.css'
    mainCssFile = files.find(file => file.match(/main-.*\.css$/));

    console.log('Found assets:', {
        mainJsFile,
        mainCssFile,
        allFiles: files.join(', ')
    });
} else {
    console.error('Assets directory not found!');
    process.exit(1);
}

if (!mainJsFile) {
    console.error('Main JavaScript file not found in assets directory!');
    // Try a more generic search through all files in the dist directory
    const allDistFiles = fs.readdirSync(distPath, { recursive: true });
    console.log('All dist files:', allDistFiles);
    process.exit(1);
}

// Read the original index.html file
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('index.html not found in the dist directory!');
    process.exit(1);
}

// Create the updated index.html content
const updatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#60A5FA" />
  <meta name="description" content="RuneRaffle - The premier platform for RuneScape raffles and competitions" />
  <title>RuneRaffle - Compete and Win RuneScape Prizes</title>
  ${mainCssFile ? `<link rel="stylesheet" href="/assets/${mainCssFile}">` : ''}
  <script>
    // Debug loading sequence
    console.log('HTML document loading started at:', new Date().toISOString());
    
    // Add error handling for script loading
    window.addEventListener('error', function(event) {
      console.error('Script loading error:', event.message);
      console.error('File:', event.filename);
      console.error('Line:', event.lineno);
      console.error('Column:', event.colno);
      
      // Create error message element
      const errorEl = document.createElement('div');
      errorEl.style.padding = '20px';
      errorEl.style.backgroundColor = '#f8d7da';
      errorEl.style.color = '#721c24';
      errorEl.style.border = '1px solid #f5c6cb';
      errorEl.style.borderRadius = '4px';
      errorEl.style.margin = '20px';
      errorEl.style.fontFamily = 'Arial, sans-serif';
      
      errorEl.innerHTML = \`
        <h2>Application Error</h2>
        <p>Failed to load application script: \${event.message}</p>
        <p>Please check the console for more details or try refreshing the page.</p>
        <button onclick="window.location.reload()" style="background: #721c24; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>
      \`;
      
      // Add to body after a delay to ensure DOM is ready
      setTimeout(() => {
        document.body.appendChild(errorEl);
      }, 1000);
    }, true);
  </script>
  <script src="/env-config.js"></script>
  <script src="/wrapper.js"></script>
  <script>
    // Verify that environment variables loaded correctly
    window.addEventListener('DOMContentLoaded', function() {
      console.log('DOM content loaded at:', new Date().toISOString());
      if (window.ENV) {
        console.log('Environment variables loaded successfully');
        console.log('Available keys:', Object.keys(window.ENV));
      } else {
        console.error('Failed to load environment variables');
      }
    });
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/${mainJsFile}"></script>
</body>
</html>`;

// Write the updated index.html file
fs.writeFileSync(indexPath, updatedHtml);
console.log('Successfully updated index.html for production!');

// Copy the wrapper.js to the dist directory
const wrapperSourcePath = path.join(__dirname, '..', 'public', 'wrapper.js');
const wrapperDestPath = path.join(distPath, 'wrapper.js');
if (fs.existsSync(wrapperSourcePath)) {
  fs.copyFileSync(wrapperSourcePath, wrapperDestPath);
  console.log('Copied wrapper.js to dist directory');
} else {
  console.error('wrapper.js not found in public directory!');
}

// Copy the direct.html to the dist directory
const directSourcePath = path.join(__dirname, '..', 'public', 'direct.html');
const directDestPath = path.join(distPath, 'direct.html');
if (fs.existsSync(directSourcePath)) {
  fs.copyFileSync(directSourcePath, directDestPath);
  console.log('Copied direct.html to dist directory');
} else {
  console.error('direct.html not found in public directory!');
}

// Also create a copy of index.html in the root directory for reference
fs.writeFileSync(path.join(__dirname, '..', 'production-index.html'), updatedHtml);
console.log('Created backup copy of production index.html in root directory');

console.log('Build process completed successfully.');