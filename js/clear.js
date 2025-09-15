window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        sessionStorage.removeItem('userBase');
        console.clear();
    }
});
