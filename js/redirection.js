// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
if (sessionStorage.length === 0) {
    window.location.href = '../index.html';
}
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        sessionStorage.clear();
        const form = document.getElementById('loginForm');
        form.reset();
    }
});

import { getUserData } from './config.js';
import { initScheduleLogic } from './schedule.js';
import { initDropdown } from './dropdown-handler.js';

document.addEventListener('DOMContentLoaded', () => {
    const allCheckboxes = document.querySelectorAll('.toggle-checkbox');

    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                if (event.target.id === 'toggle-schedule') {
                    initScheduleLogic();
                }
                if (event.target.id ==='toggle-journal') {
                    const userData = getUserData();
                    if(userData){ initDropdown(userData); }
                }
            }
        });
    });
});



