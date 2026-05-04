if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("{{base}}sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.log("SW registration failed:", err));
}