// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { loadScheduleData } from './schedule-api.js';
import { 
    displaySchedule, 
    setupDaySelector, 
    setScheduleLoadingState, 
    setScheduleLoadedState,
    displayScheduleError
} from './schedule-dom.js';
import { getUserData } from '../config.js';

export const initScheduleLogic = async () => {
    const contentSchedule = document.getElementById('scheduleText');
    if (contentSchedule.dataset.loaded === 'true') {
        return;
    }

    setScheduleLoadingState();

    try {
        const payload = {
            action: 'get_schedule'
        };
        const groupedByDay = await loadScheduleData(payload);
        
        if (!groupedByDay || Object.keys(groupedByDay).length === 0) {
            displayScheduleError('Розклад відсутній.');
            setScheduleLoadedState();
            return;
        }
        const userData = getUserData();
        const role = userData ? userData.role : '';

        setupDaySelector(groupedByDay, role);
        setScheduleLoadedState();

    } catch (err) {
        console.error('Помилка запиту:', err);
        displayScheduleError('Не вдалося завантажити розклад. Спробуйте пізніше.');
    }
};