// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
import { API_URL_SCHEDULE } from '../config.js';

export const loadScheduleData = async (role, classOrSubject, lastName, firstName) => {
    const params = new URLSearchParams();
    params.append('role', role);
    params.append('lastName', lastName);
    params.append('firstName', firstName);

    if (role === 'teacher') {
        params.append('subject', classOrSubject);
    } else if (role === 'student') {
        params.append('class', classOrSubject);
    }

    const url = `${API_URL_SCHEDULE}?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Помилка мережі: ${res.status}`);
    }
    return res.json();
};
