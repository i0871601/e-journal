document.addEventListener('DOMContentLoaded', () => {
    // Оновлення тексту кнопки view з локального сховища
    const updateButtonText = () => {
        const buttonText = sessionStorage.getItem('buttonText');
        const viewButton = document.getElementById('view');
        if (buttonText && viewButton) {
            viewButton.textContent = buttonText;
            const scriptName = sessionStorage.getItem('scriptName');
            if (scriptName) {
                const script = document.createElement('script');
                script.src = scriptName;
                document.body.appendChild(script);
            }
        }
    };

    /**
     * Динамічно відображає розклад, згрупований за днями.
     * @param {Object} groupedByDay - Об'єкт розкладу, згрупований за днями тижня.
     * @param {string} role - Роль користувача ('student' або 'teacher').
     */
    const displaySchedule = (groupedByDay, role) => {
        const contentSchedule = document.getElementById('scheduleText');
        contentSchedule.innerHTML = '';

        if (!groupedByDay || Object.keys(groupedByDay).length === 0) {
            contentSchedule.textContent = 'Розклад відсутній.';
            return;
        }

        const dataMapping = {
            'student': ['Subject', 'Teacher_LastName'],
            'teacher': ['Subject', 'Class']
        };

        const displayFields = dataMapping[role];

        for (const day in groupedByDay) {
            const dayBlock = document.createElement('div');
            dayBlock.classList.add('schedule-day');
            dayBlock.innerHTML = `<h3>${day}</h3>`;

            groupedByDay[day].forEach(item => {
                const lessonInfo = document.createElement('p');
                const linkHtml = item.Link ? `<a href="${item.Link}" target="_blank">Посилання</a>` : '';
                
                const infoText = displayFields.map(field => item[field]).join(' | ');
                
                lessonInfo.innerHTML = `${item.Time} | ${infoText} | ${linkHtml}`;
                dayBlock.appendChild(lessonInfo);
            });
            contentSchedule.appendChild(dayBlock);
        }
    };

    /**
     * Завантажує розклад з воркера.
     */
    const loadSchedule = async () => {
        const contentSchedule = document.getElementById('scheduleText');
        if (contentSchedule.dataset.loaded === 'true') {
            return;
        }

        contentSchedule.textContent = 'Завантаження розкладу...';

        try {
            const role = sessionStorage.getItem('role');
            const classOrSubject = sessionStorage.getItem('classOrsubject');
            const lastName = sessionStorage.getItem('lastName');
            const firstName = sessionStorage.getItem('firstName');

            if (!role || !classOrSubject || !lastName || !firstName) {
                window.location.href = 'index.html';
                return;
            }

            const params = new URLSearchParams();
            params.append('role', role);
            params.append('lastName', lastName);
            params.append('firstName', firstName);
            
            if (role === 'teacher') {
                params.append('subject', classOrSubject);
            } else if (role === 'student') {
                params.append('class', classOrSubject);
            }

            const url = `https://worker-schedule.i0871601.workers.dev/?${params.toString()}`;
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`Помилка мережі: ${res.status}`);
            }

            const data = await res.json();
            displaySchedule(data, role);
            contentSchedule.dataset.loaded = 'true';

        } catch (err) {
            console.error('Помилка запиту:', err);
            const contentSchedule = document.getElementById('scheduleText');
            contentSchedule.textContent = 'Не вдалося завантажити розклад. Спробуйте пізніше.';
        }
    };

    // Ініціалізація
    updateButtonText();
    loadSchedule();
});


