// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.

// Перенаправлення, якщо немає сесії (закоментовано для тестування)
// if (sessionStorage.length === 0) {
//     window.location.href = 'index.html';
// }
// window.addEventListener('pageshow', (event) => {
//     if (event.persisted) {
//         sessionStorage.clear();
//         const form = document.getElementById('loginForm');
//         form.reset();
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    // === ЛОГІКА АНІМАЦІЇ ТА ПЕРЕМИКАННЯ ===
    const scheduleToggle = document.getElementById('toggle-schedule');
    const journalToggle = document.getElementById('toggle-journal');
    const mainContent = document.getElementById('mainContent');
    const scheduleContent = document.getElementById('schedule');
    const journalContent = document.getElementById('journal');

    scheduleToggle.addEventListener('click', () => {
        if (!scheduleToggle.classList.contains('active')) {
            scheduleToggle.classList.add('active');
            journalToggle.classList.remove('active');
            mainContent.classList.add('hide-journal');
            mainContent.classList.remove('hide-schedule');
        }
    });

    journalToggle.addEventListener('click', () => {
        if (!journalToggle.classList.contains('active')) {
            journalToggle.classList.add('active');
            scheduleToggle.classList.remove('active');
            mainContent.classList.add('hide-schedule');
            mainContent.classList.remove('hide-journal');
        }
    });

    // === ДИНАМІЧНЕ ЗАВАНТАЖЕННЯ МОДУЛІВ ===
    const allCheckboxes = document.querySelectorAll('.toggle-checkbox');
    const loadedModules = {};

    const loadModule = async (modulePath, moduleName) => {
        if (loadedModules[modulePath]) {
            return;
        }
        
        try {
            const module = await import(modulePath);
            loadedModules[modulePath] = true;
            
            if (moduleName === 'schedule') {
                module.initScheduleLogic();
            } else if (moduleName === 'teacher') {
                module.initTeacherLogic();
            } else if (moduleName === 'student') {
                module.initStudentLogic();
            }

        } catch (error) {
            console.error("Помилка при динамічному завантаженні модуля:", error);
        }
    };
    
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            const role = sessionStorage.getItem('role');
            let modulePath;
            let moduleName;

            if (event.target.id === 'toggle-schedule') {
                modulePath = './js/schedule/schedule-logic.js';
                moduleName = 'schedule';
            } else {
                if (role === 'teacher') {
                    modulePath = './js/journal/teacher-logic.js';
                    moduleName = 'teacher';
                } else {
                    modulePath = './js/journal/student-logic.js';
                    moduleName = 'student';
                }
            }
            
            if (isChecked) {
                loadModule(modulePath, moduleName);
            }
        });
    });
});


