// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
// schedule-logic.js

import { loadScheduleData } from './schedule-api.js';
import { getUserData } from '../config.js'; // Імпортуємо функцію getUserData
import { 
    displaySchedule, 
    setupDaySelector, 
    setScheduleLoadingState, 
    setScheduleLoadedState,
    displayScheduleError
} from './schedule-dom.js';

export const initScheduleLogic = async () => {
    const contentSchedule = document.getElementById('scheduleText');
    if (contentSchedule.dataset.loaded === 'true') {
        return;
    }

    setScheduleLoadingState();

    try {
        const userData = getUserData();
        if (!userData) {
            displayScheduleError('Помилка: Немає даних користувача.');
            setScheduleLoadedState();
            return;
        }

        const payload = {
            action: 'get_schedule'
        };

        const groupedByDay = await loadScheduleData(payload);

        if (!groupedByDay || Object.keys(groupedByDay).length === 0) {
            displayScheduleError('Розклад відсутній.');
            setScheduleLoadedState();
            return;
        }

        // Передаємо role, отриману з об'єкта userData
        setupDaySelector(groupedByDay, userData.role);
        setScheduleLoadedState();

    } catch (err) {
        console.error('Помилка запиту:', err);
        displayScheduleError(err.message || 'Не вдалося завантажити розклад. Спробуйте пізніше.');
    }
};