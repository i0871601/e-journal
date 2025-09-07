// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.

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
        console.log("Лог 1: Дані користувача з сесії:", userData);
        if (!userData) {
            displayScheduleError('Помилка: Немає даних користувача.');
            setScheduleLoadedState();
            return;
        }

        const payload = {
            action: 'schedule'
        };
        console.log("Лог 2: Відправка до API:", payload);

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
