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
    const toggleJournalUI = (role) => {
        const classDropdown = document.getElementById('classOfjournal');
        const subjectDropdown = document.getElementById('subjectTeacher');

        if (classDropdown && subjectDropdown) {
            if (role === 'teacher') {
                classDropdown.style.display = 'block';
                subjectDropdown.style.display = 'block';
            } else if (role === 'student') {
                classDropdown.style.display = 'none';
                subjectDropdown.style.display = 'block';
            }
        }
    };
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
                if (moduleName.includes('journal')) {
                    toggleJournalUI(role);
                }
            } else {
                const classDropdown = document.getElementById('classOfjournal');
                const subjectDropdown = document.getElementById('subjectTeacher');
                if (classDropdown) classDropdown.style.display = 'none';
                if (subjectDropdown) subjectDropdown.style.display = 'none';
            }
        });
    });

});
