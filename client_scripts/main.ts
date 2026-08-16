if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("{{base}}sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.log("SW registration failed:", err));
}

// Dark mode functionality
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeIcon = document.getElementById('darkModeIcon');

// Check for saved theme preference or respect system preference
const savedTheme = localStorage.getItem('theme');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Set theme based on saved preference or system preference
if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-mode');
    darkModeIcon.textContent = '🌙';
} else {
    document.body.classList.remove('dark-mode');
    darkModeIcon.textContent = '☀️';
}

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Update icon
    if (document.body.classList.contains('dark-mode')) {
        darkModeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        darkModeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
});

// Listen for system theme changes
prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        if (e.matches) {
            document.body.classList.add('dark-mode');
            darkModeIcon.textContent = '🌙';
        } else {
            document.body.classList.remove('dark-mode');
            darkModeIcon.textContent = '☀️';
        }
    }
});