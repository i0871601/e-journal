const divJournal = document.getElementById('contentJournal');
const checkedContentJournal = document.getElementById('off-ContentJournal-on');

function renderTable(mapLessons, mapStudents, mapRecords) {
    if (checkedContentJournal.checked) {
        setTimeout(() => {
            checkedContentJournal.checked = false;
            divJournal.innerHTML = '';
        }, 1000);
    }
    checkedContentJournal.checked = true;
    
    const thead = divJournal.createTHead();
    const headerRow = thead.insertRow();

    const studentHeader = document.createElement('th');
    studentHeader.textContent = "Учень";
    headerRow.appendChild(studentHeader);

    mapLessons.forEach(lesson => {
        const th = document.createElement('th');
        th.textContent = `${lesson.lessonNumber})`;
        headerRow.appendChild(th);
    });

    const tbody = divJournal.createTBody();
  
    mapStudents.forEach(el => {
        const row = tbody.insertRow();
        
        // Перша комірка — ім'я учня
        const nameCell = row.insertCell();
        nameCell.textContent = mapStudents.lastName;
        
        // Наступні комірки — оцінки під кожен урок із заголовка
        mapLessons.forEach(lesson => {
            const scoreCell = row.insertCell();
            
            // Просто беремо оцінку з нашої мапи за прізвищем та номером уроку
            const studentGrades = mapRecords[el];
            const score = studentGrades ? studentGrades[mapLessons.lessonNumber] : '';
            
            scoreCell.textContent = score !== undefined ? score : ''; 
        });
    });

    console.log(mapLessons);
    console.log(mapStudents);
    console.log(mapRecords);
};

export function renderLog(role, subject, classes, teacherLastName, map) {
    const mapRecords = {};

    map.grades.forEach(el => {
        if(!mapRecords[el.lastName]) mapRecords[el.lastName] = {};
        mapRecords[el.lastName][el.lessonNumber] = el.rating
    });
    renderTable(map.lessons, map.students, mapRecords);
};