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

    const loadModule = async (modulePath) => {
        if (loadedModules[modulePath]) {
            return;
        }

        try {
            const module = await import(modulePath);
            loadedModules[modulePath] = true;
            
            if (typeof module.initScheduleLogic === 'function') {
                module.initScheduleLogic();
            } else if (typeof module.initJournalLogic === 'function') {
                module.initJournalLogic();
            }

        } catch (error) {
            console.error("Помилка при динамічному завантаженні модуля:", error);
        }
    };
    
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            let modulePath;

            if (event.target.id === 'toggle-schedule') {
                modulePath = './js/schedule/schedule-logic.js';
            } else {
                modulePath = sessionStorage.getItem('scriptName');
            }
            
            if (isChecked) {
                allCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== event.target) {
                        otherCheckbox.checked = false;
                    }
                });
                
                loadModule(modulePath);
            }
        });
    });
});