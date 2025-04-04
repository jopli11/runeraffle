// Helper script to aid with loading the main bundle
(function() {
    console.log('Wrapper script initializing...');

    // Function to handle loading the main script
    function loadMainScript() {
        // Find the main JavaScript file
        const scripts = document.querySelectorAll('script[type="module"]');
        const mainScriptUrl = scripts.length > 0 ? scripts[0].getAttribute('src') : null;

        console.log('Main script URL detected:', mainScriptUrl);

        if (!mainScriptUrl) {
            console.error('Could not find main script URL');
            displayError('Could not find main application script.');
            return;
        }

        // Check if ENV is available
        if (!window.ENV) {
            console.warn('window.ENV not available - checking if env-config.js loaded');

            const envScript = document.createElement('script');
            envScript.src = '/env-config.js';
            envScript.onload = function() {
                console.log('Loaded env-config.js manually');
                if (window.ENV) {
                    console.log('ENV is now available with keys:', Object.keys(window.ENV));
                } else {
                    console.error('ENV still not available after loading env-config.js');
                }
            };
            envScript.onerror = function() {
                console.error('Failed to load env-config.js');
                displayError('Failed to load environment configuration.');
            };

            document.head.appendChild(envScript);
        }
    }

    // Function to display error UI
    function displayError(message) {
        const errorElement = document.createElement('div');
        errorElement.style.padding = '20px';
        errorElement.style.margin = '20px';
        errorElement.style.backgroundColor = '#f8d7da';
        errorElement.style.color = '#721c24';
        errorElement.style.border = '1px solid #f5c6cb';
        errorElement.style.borderRadius = '4px';
        errorElement.style.fontFamily = 'Arial, sans-serif';

        errorElement.innerHTML = `
      <h2>Application Error</h2>
      <p>${message}</p>
      <p>Please check the browser console for more details.</p>
      <button onclick="window.location.reload()" style="background: #721c24; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>
    `;

        // Add to body
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.appendChild(errorElement);
        } else {
            document.body.appendChild(errorElement);
        }
    }

    // Run the script when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadMainScript);
    } else {
        loadMainScript();
    }
})();