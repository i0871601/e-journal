const adminApiURL = "https://admin-worker.i0871601.workers.dev/"; 
const logoutButton = document.getElementById('logoutButton');
const scheduleOutput = document.getElementById('scheduleOutput');
const loadingMessage = document.querySelector('.content p');
const dayInput = document.getElementById('dayInput');
const classInput = document.getElementById('classInput');
const filterButton = document.getElementById('filterButton');
const addScheduleForm = document.getElementById('addScheduleForm');
const addMessage = document.getElementById('addMessage');
const editFormContainer = document.getElementById('editFormContainer'); // Новий елемент
const editScheduleForm = document.getElementById('editScheduleForm'); // Новий елемент

let fullScheduleData = []; 

function displaySchedule() {
    scheduleOutput.innerHTML = ""; 
    editFormContainer.style.display = 'none'; // Приховуємо форму редагування

    const selectedDay = dayInput.value.trim();
    const selectedClass = classInput.value.trim();
    
    const filteredSchedule = fullScheduleData.filter(item => {
        const matchesDay = selectedDay === '' || item.Day.toLowerCase() === selectedDay.toLowerCase();
        const matchesClass = selectedClass === '' || item.Class.toLowerCase() === selectedClass.toLowerCase();
        return matchesDay && matchesClass;
    });

    const headingParagraph = document.createElement('p');
    headingParagraph.innerHTML = `<b>Відсортований розклад:</b>`;
    scheduleOutput.appendChild(headingParagraph);

    if (filteredSchedule.length === 0) {
        const noResults = document.createElement('p');
        noResults.textContent = "Немає даних, що відповідають фільтрам.";
        scheduleOutput.appendChild(noResults);
        return;
    }

    filteredSchedule.forEach(item => {
        const paragraph = document.createElement('p');
        const link = item.Link && item.Link !== "NULL" ? `<br>Посилання: <a href="${item.Link}" target="_blank">Перейти</a>` : "";
        
        paragraph.innerHTML = `День: ${item.Day}, Урок: ${item.lessonNumber}, Час: ${item.Time}, Клас: ${item.Class}, Предмет: ${item.Subject}, Вчитель: ${item.Teacher_LastName}${link}`;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Видалити';
        deleteButton.classList.add('delete-button');
        deleteButton.dataset.rowid = item.rowid;
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Редагувати';
        editButton.classList.add('edit-button');
        editButton.dataset.rowid = item.rowid;

        paragraph.appendChild(editButton);
        paragraph.appendChild(deleteButton);
        scheduleOutput.appendChild(paragraph);
    });
}

// Нова функція для заповнення та відображення форми
function displayEditForm(item) {
    document.getElementById('editRowid').value = item.rowid;
    document.getElementById('editDay').value = item.Day;
    document.getElementById('editLessonNumber').value = item.lessonNumber;
    document.getElementById('editTime').value = item.Time;
    document.getElementById('editClass').value = item.Class;
    document.getElementById('editSubject').value = item.Subject;
    document.getElementById('editTeacher').value = item.Teacher_LastName;
    document.getElementById('editLink').value = item.Link && item.Link !== 'NULL' ? item.Link : '';

    scheduleOutput.innerHTML = ''; // Приховуємо розклад
    editFormContainer.style.display = 'block'; // Відображаємо форму
}

// Функція для додавання запису
async function addSchedule(event) {
    event.preventDefault(); 
    
    const newEntry = {
        action: 'addSchedule',
        role: sessionStorage.getItem('role'),
        Day: addScheduleForm.elements['addDay'].value,
        lessonNumber: addScheduleForm.elements['addLessonNumber'].value,
        Time: addScheduleForm.elements['addTime'].value,
        Class: addScheduleForm.elements['addClass'].value,
        Subject: addScheduleForm.elements['addSubject'].value,
        Teacher_LastName: addScheduleForm.elements['addTeacher'].value,
        Link: addScheduleForm.elements['addLink'].value
    };

    try {
        const response = await fetch(adminApiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEntry)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Помилка додавання запису.');
        }

        addMessage.textContent = data.message;
        addMessage.style.color = 'green';
        addScheduleForm.reset(); 

        await getSchedule();

    } catch (error) {
        addMessage.textContent = "Помилка: " + error.message;
        addMessage.style.color = 'red';
        console.error("Помилка:", error);
    }
}

// Функція для видалення запису
async function deleteScheduleEntry(rowid) {
    try {
        const response = await fetch(adminApiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'deleteSchedule', role: sessionStorage.getItem('role'), rowid: rowid })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Помилка видалення запису.');
        }

        alert(data.message);
        await getSchedule();

    } catch (error) {
        alert("Помилка: " + error.message);
        console.error("Помилка:", error);
    }
}

// Функція для оновлення запису
async function editScheduleEntry(entry) {
    try {
        const response = await fetch(adminApiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'editSchedule',
                role: sessionStorage.getItem('role'),
                ...entry
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Помилка оновлення запису.');
        }

        alert(data.message);
        await getSchedule();

    } catch (error) {
        alert("Помилка: " + error.message);
        console.error("Помилка:", error);
    }
}

async function getSchedule() {
    try {
        const response = await fetch(adminApiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'getSchedule', role: sessionStorage.getItem('role') })
        });

        const data = await response.json();

        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        if (!response.ok) {
            throw new Error(data.message || 'Помилка отримання розкладу.');
        }

        fullScheduleData = data.schedule; 
        displaySchedule(); 

    } catch (error) {
        console.error("Помилка:", error);
        alert("Помилка: " + error.message);
        sessionStorage.clear();
        window.location.href = "index.html"; 
    }
}

filterButton.addEventListener('click', displaySchedule);
addScheduleForm.addEventListener('submit', addSchedule);

scheduleOutput.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.delete-button');
    if (deleteButton) {
        const rowidToDelete = parseInt(deleteButton.dataset.rowid, 10);
        
        if (!isNaN(rowidToDelete)) {
            if (confirm(`Ви впевнені, що хочете видалити запис з rowid ${rowidToDelete}?`)) {
                deleteScheduleEntry(rowidToDelete);
            }
        } else {
            console.error("Некоректний ID для видалення:", deleteButton.dataset.rowid);
            alert("Помилка: Некоректний ID для видалення.");
        }
    }
    const editButton = event.target.closest('.edit-button');
    if (editButton) {
        const rowidToEdit = parseInt(editButton.dataset.rowid, 10);
        const itemToEdit = fullScheduleData.find(item => item.rowid === rowidToEdit);
        if (itemToEdit) {
            displayEditForm(itemToEdit);
        } else {
            alert('Запис не знайдено.');
        }
    }
});

editScheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedEntry = {
        rowid: document.getElementById('editRowid').value,
        Day: document.getElementById('editDay').value,
        lessonNumber: document.getElementById('editLessonNumber').value,
        Time: document.getElementById('editTime').value,
        Class: document.getElementById('editClass').value,
        Subject: document.getElementById('editSubject').value,
        Teacher_LastName: document.getElementById('editTeacher').value,
        Link: document.getElementById('editLink').value
    };
    await editScheduleEntry(updatedEntry);
});

document.getElementById('cancelEdit').addEventListener('click', () => {
    displaySchedule();
});


window.onload = function() {
    getSchedule();
};

logoutButton.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = "index.html";
});