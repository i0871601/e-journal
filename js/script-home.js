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
    const userData = getUserData();
    if (userData) {
        initDropdown(userData);
    }

    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const isChecked = event.target.checked;

            if (isChecked) {
                allCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== event.target) {
                        otherCheckbox.checked = false;
                    }
                });
            }
            if (isChecked) {
                if (event.target.id === 'toggle-schedule') {
                    initScheduleLogic();
                } 
            }
        });
    });
});







