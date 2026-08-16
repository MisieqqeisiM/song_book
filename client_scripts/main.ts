if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("{{base}}sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.log("SW registration failed:", err));
}

document.addEventListener('DOMContentLoaded', () => {
    // Dark mode functionality
    const darkModeIcon = document.getElementById('darkModeIcon');

    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-pf-theme', 'dark');
            if (darkModeIcon) darkModeIcon.textContent = '🌙';
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.removeAttribute('data-pf-theme');
            if (darkModeIcon) darkModeIcon.textContent = '☀️';
        }
    }

    function getIsDark() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Set theme based on saved preference or system preference
    applyTheme(getIsDark());

    // Toggle dark mode using event delegation
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('dark-mode-toggle') || target.closest('.dark-mode-toggle')) {
            const isDark = document.body.classList.toggle('dark-mode');
            if (isDark) {
                document.documentElement.setAttribute('data-pf-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-pf-theme');
            }
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (darkModeIcon) darkModeIcon.textContent = isDark ? '🌙' : '☀️';
        }
    });

    // Random song functionality
    const randomSongBtn = document.getElementById('randomSongBtn');
    if (randomSongBtn) {
        randomSongBtn.addEventListener('click', async () => {
            try {
                const resp = await fetch('./songs.json');
                const songs: string[] = await resp.json();
                if (songs.length > 0) {
                    const randomSong = songs[Math.floor(Math.random() * songs.length)];
                    window.location.href = randomSong;
                }
            } catch (e) {
                console.error('Failed to load songs list:', e);
            }
        });
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches);
        }
    });
});
