// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
//if (sessionStorage.length === 0) {
//    //window.location.href = 'index.html';
//}
//window.addEventListener('pageshow', (event) => {
//    //if (event.persisted) {
//    //    sessionStorage.clear();
//    //    const form = document.getElementById('loginForm');
//    //    form.reset();
//    //}
//});

import { getUserData } from './js/config.js';
import { initScheduleLogic } from './js/schedule.js';
import { initDropdown } from './js/dropdown-handler.js';
import { setupAddLessonForm } from './js/grade-client.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const allCheckboxes = document.querySelectorAll('.toggle-checkbox');
    const userData = getUserData();
    if (userData) {
        initDropdown(userData);
    }

    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            
            const role = userData ? userData.role : null;

            // Знімаємо позначку з інших чекбоксів, коли один активовано
            if (isChecked) {
                allCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== event.target) {
                        otherCheckbox.checked = false;
                    }
                });
            }

            // ✅ Нова логіка: просто перевіряємо ID і викликаємо функцію
            if (isChecked) {
                if (event.target.id === 'toggle-schedule') {
                    initScheduleLogic();
                } else if (event.target.id === 'toggle-journal') {
                      if (role === 'teacher') {
                            setupAddLessonForm(); 
                      }
                }
            }
        });
    });
});





