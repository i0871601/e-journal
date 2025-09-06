// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
// schedule-api.js

import { request, API_URL_SCHEDULE } from '../config.js';

export const loadScheduleData = async (payload) => {
    const response = await request(API_URL_SCHEDULE, payload);
    
    if (response.success === false) {
        throw new Error(response.message);
    }
    
    return response.scheduleData;
};