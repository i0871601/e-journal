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

import { getUserData } from './js/config.js';
document.addEventListener('DOMContentLoaded', () => {
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
            
            const userData = getUserData();
            const role = userData ? userData.role : null;
            let modulePath;
            let moduleName;

            // Знімаємо позначку з інших чекбоксів, коли один активовано
            if (isChecked) {
                allCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== event.target) {
                        otherCheckbox.checked = false;
                    }
                });
            }

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

