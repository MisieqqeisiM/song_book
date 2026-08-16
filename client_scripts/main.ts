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
            const metaTheme = document.getElementById('theme-color-meta');
            if (metaTheme) metaTheme.setAttribute('content', '#121212');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.removeAttribute('data-pf-theme');
            if (darkModeIcon) darkModeIcon.textContent = '☀️';
            const metaTheme = document.getElementById('theme-color-meta');
            if (metaTheme) metaTheme.setAttribute('content', '#f5f5f5');
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
                const metaTheme = document.getElementById('theme-color-meta');
                if (metaTheme) metaTheme.setAttribute('content', '#121212');
            } else {
                document.documentElement.removeAttribute('data-pf-theme');
                const metaTheme = document.getElementById('theme-color-meta');
                if (metaTheme) metaTheme.setAttribute('content', '#f5f5f5');
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

    // Keep screen on functionality
    let wakeLock: any = null;
    const keepScreenOnToggle = document.getElementById('keepScreenOnToggle');
    const keepScreenOnIcon = document.getElementById('keepScreenOnIcon');

    async function enableWakeLock() {
        if (!("wakeLock" in navigator)) {
            console.log("Screen Wake Lock is not supported");
            return;
        }

        try {
            wakeLock = await (navigator as any).wakeLock.request('screen');
            localStorage.setItem('keepScreenOn', 'true');
            if (keepScreenOnToggle) keepScreenOnToggle.classList.add('active');
        } catch (err) {
            console.error("Wake lock request failed:", err);
            localStorage.setItem('keepScreenOn', 'false');
        }
    }

    async function disableWakeLock() {
        localStorage.setItem('keepScreenOn', 'false');
        if (keepScreenOnToggle) keepScreenOnToggle.classList.remove('active');

        if (wakeLock) {
            await wakeLock.release();
            wakeLock = null;
        }
    }

    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('keep-screen-on-toggle') || target.closest('.keep-screen-on-toggle')) {
            if (wakeLock) {
                disableWakeLock();
            } else {
                enableWakeLock();
            }
        }
    });

    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && localStorage.getItem('keepScreenOn') === 'true') {
            await enableWakeLock();
        }
    });

    if (localStorage.getItem('keepScreenOn') === 'true') {
        enableWakeLock();
    }
});
