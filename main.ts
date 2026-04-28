if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.log("SW registration failed:", err));
}