const divJournal = document.getElementById('contentJournal');
const checkedContentJournal = document.getElementById('off-ContentJournal-on');

function renderTable(mapLessons, mapStudents, mapRecords) {
    checkedContentJournal.checked = true;
    
    const thead = divJournal.createTHead();
    const headerRow = thead.insertRow();

    const studentHeader = document.createElement('th');
    studentHeader.textContent = "Учень";
    headerRow.appendChild(studentHeader);
};

export function renderLog(role, subject, classes, teacherLastName, map) {
    const mapRecords = {};

    map.grades.forEach(el => {
        if(!mapRecords[el.lastName]) mapRecords[el.lastName] = {};
        mapRecords[el.lastName][el.lessonNumber] = el.rating
    });
    renderTable(map.lessons, map.students, mapRecords);
};