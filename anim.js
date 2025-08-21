document.addEventListener('DOMContentLoaded', function() {
    const scheduleButton = document.getElementById('scheduleButton');
    const viewButton = document.getElementById('view');
    const lessonButton = document.getElementById('Lesson');
    const hiddenContainer = document.getElementById('hiddenContainer');
    const GradeOrJournal = document.getElementById('GradeOrJournal');
    const Lessoncontent = document.getElementById('contentLesson');
    
    // Показати контейнер, коли натискається кнопка Schedule
    scheduleButton.addEventListener('click', function() {
        hiddenContainer.style.display = 'block';
        GradeOrJournal.style.display='none';
        Lessoncontent.style.display='none';
    });
    
    // Сховати контейнер, коли натискається кнопка View
    viewButton.addEventListener('click', function() {
        hiddenContainer.style.display = 'none';
        GradeOrJournal.style.display='block';
        Lessoncontent.style.display='none';
    });
    lessonButton.addEventListener('click', function() {
        hiddenContainer.style.display = 'none';
        GradeOrJournal.style.display='none';
        Lessoncontent.style.display='block';
    });
});
