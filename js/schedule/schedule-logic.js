// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { loadScheduleData } from './schedule-api.js';
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
        const role = sessionStorage.getItem('role');
        const classOrSubject = sessionStorage.getItem('classOrsubject');
        const lastName = sessionStorage.getItem('lastName');
        const firstName = sessionStorage.getItem('firstName');
        
        const data = await loadScheduleData(role, classOrSubject, lastName, firstName);
        
        if (!groupedByDay || Object.keys(groupedByDay).length === 0) {
            displayScheduleError('Розклад відсутній.');
            setScheduleLoadedState();
            return;
        }

        setupDaySelector(groupedByDay, role);
        setScheduleLoadedState();

    } catch (err) {
        console.error('Помилка запиту:', err);
        displayScheduleError('Не вдалося завантажити розклад. Спробуйте пізніше.');
    }
};