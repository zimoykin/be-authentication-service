document.addEventListener('DOMContentLoaded', function() {
    // Define the custom event
    const naviDone = new Event('navi-done');

    // Load the navbar
    fetch('../../navbar.html')
        .then(response => response.text())
        .then(data => {
            // Insert the navbar HTML
            document.getElementById('navbar-placeholder').innerHTML = data;

            // Dispatch the custom event to indicate navbar is done loading
            document.dispatchEvent(naviDone);

            // Initial setup of event listeners
            setupNavbar();
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
        });
});

// Function to set up the navbar after it's loaded
function setupNavbar() {
    const accessToken = localStorage.getItem('accessToken');

    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const quitBtn = document.getElementById('quitBtn');

    // Show/hide navbar items based on the presence of accessToken
    if (accessToken) {
        // Hide Register, Login, Forgot Password links and show Quit button
        registerLink.style.display = 'none';
        loginLink.style.display = 'none';
        forgotPasswordLink.style.display = 'none';
        quitBtn.style.display = 'inline'; // Show Quit button
    } else {
        // Show Register, Login, Forgot Password links and hide Quit button
        registerLink.style.display = 'inline';
        loginLink.style.display = 'inline';
        forgotPasswordLink.style.display = 'inline';
        quitBtn.style.display = 'none'; // Hide Quit button
    }

    // Add click event to Quit button
    quitBtn.addEventListener('click', function () {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
    });
}

// Add event listener for custom event 'navi-done'
document.addEventListener('navi-done', setupNavbar);
