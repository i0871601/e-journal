window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        sessionStorage.clear();
        console.clear();
    }
});
