document.addEventListener('DOMContentLoaded', function() {
    const scheduleButton = document.getElementById('scheduleButton');
    const viewButton = document.getElementById('view');
    const hiddenContainer = document.getElementById('hiddenContainer');
    const text = document.getElementById('quote');
    
    // Показати контейнер, коли натискається кнопка Schedule
    scheduleButton.addEventListener('click', function() {
        hiddenContainer.style.display = 'block';
        text.style.display='none';
    });
    
    // Сховати контейнер, коли натискається кнопка View
    viewButton.addEventListener('click', function() {
        hiddenContainer.style.display = 'none';
        text.style.display='block';
    });
});
