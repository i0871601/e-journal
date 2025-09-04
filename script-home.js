//Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
//if (sessionStorage.length === 0) {
    //window.location.href = 'index.html'; 
//}
//window.addEventListener('pageshow', (event) => {
    //if (event.persisted) {
        //sessionStorage.clear();
        //const form = document.getElementById('loginForm');
        //form.reset();
    //}
//});

document.addEventListener('DOMContentLoaded', () => {
    const allCheckboxes = document.querySelectorAll('.toggle-checkbox');
    
    const loadedModules = {};

    const loadModule = async (moduleName, modulePath) => {
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
