const divJournal = document.getElementById('contentJournal');
const checkedContentJournal = document.getElementById('off-ContentJournal-on');

function renderTable(mapLessons, mapStudents, mapRecords) {
    if (checkedContentJournal.checked) {
        divJournal.innerHTML = '';
        checkedContentJournal.checked = false;
    }
    
    const thead = divJournal.createTHead();
    const headerRow = thead.insertRow();

    const studentHeader = document.createElement('th');
    studentHeader.textContent = "Прізвище";
    headerRow.appendChild(studentHeader);

    mapLessons.forEach(lesson => {
        const th = document.createElement('th');
        const shortDate = lesson.Date ? lesson.Date.slice(0, 5) : '??.??';
        th.textContent = shortDate;
        headerRow.appendChild(th);
    });

    const tbody = divJournal.createTBody();
  
    mapStudents.forEach(student => {
        const row = tbody.insertRow();
        
        // Перша комірка — ім'я учня
        const nameCell = row.insertCell();
        nameCell.textContent = `${student.lastName}`;
        
        // Наступні комірки — оцінки під кожен урок із заголовка
        mapLessons.forEach(lesson => {
            const scoreCell = row.insertCell();
            
            // Просто беремо оцінку з нашої мапи за прізвищем та номером уроку
            const studentGrades = mapRecords[student.lastName];
            const score = studentGrades ? studentGrades[lesson.lessonNumber] : '';
            
            scoreCell.textContent = score !== undefined ? score : ''; 
        });
    });

    console.log(mapLessons);
    console.log(mapStudents);
    console.log(mapRecords);
    checkedContentJournal.checked = true;
};

export function renderLog(role, subject, classes, teacherLastName, map) {
    const mapRecords = {};
    
    if(map.students.length === 0) { console.log("Не має учнів"); return};

    map.grades.forEach(el => {
        if(!mapRecords[el.lastName]) mapRecords[el.lastName] = {};
        mapRecords[el.lastName][el.lessonNumber] = el.rating
    });
    renderTable(map.lessons, map.students, mapRecords);
};