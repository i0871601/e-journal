import { request } from './js/config.js';

const divJournal = document.getElementById('contentJournal');
const checkedContentJournal = document.getElementById('off-ContentJournal-on');
const checkedInfoDiv = document.getElementById('info-div');

function renderTable(mapLessons, mapStudents, mapRecords, role) {
    if (checkedContentJournal.checked) {
        divJournal.innerHTML = '';
        checkedContentJournal.checked = false;
    }
    
    const thead = divJournal.createTHead();
    const headerRow = thead.insertRow();

    const studentHeader = document.createElement('th');
    studentHeader.textContent = "Прізвище";
    headerRow.appendChild(studentHeader);

    mapLessons.forEach((lesson, index) => {
        const th = document.createElement('th');

        const shortDate = lesson.Date ? lesson.Date.slice(0, 5) : '??.??';
        th.textContent = shortDate;

        //th.textContent = `${lesson.lessonNumber}`;
        /*if (lesson.Date && lesson.Date.length >= 5) {
            const day = lesson.Date.slice(0, 2);   // Витягуємо "21"
            const month = lesson.Date.slice(3, 5); // Витягуємо "05"
            
            // Використовуємо innerHTML, щоб браузер зчитав тег <br> як перенос
            th.innerHTML = `${day}<br><small>${month}</small>`;
        } else {
            th.innerHTML = '??<br>??';
        }*/
        th.dataset.lessonIndex = index;
        headerRow.appendChild(th);
    });

    const tbody = divJournal.createTBody();
  
    mapStudents.forEach(student => {
        const row = tbody.insertRow();
        
        const nameCell = row.insertCell();
        nameCell.textContent = `${student.lastName}`;
        
        mapLessons.forEach(lesson => {
            const scoreCell = row.insertCell();
            
            const studentGrades = mapRecords[student.lastName];
            const score = studentGrades ? studentGrades[lesson.lessonNumber] : '';
            
            scoreCell.textContent = score !== undefined ? score : ''; 

            if (role === 'teacher') {
                scoreCell.contentEditable = true;
                scoreCell.dataset.student = student.lastName;
                scoreCell.dataset.lesson = lesson.lessonNumber;
            } else {
                scoreCell.contentEditable = false;
            }
        });
    });

    checkedContentJournal.checked = true;
};

export function renderLog(role, subject, classes, teacherLastName, map) {
    const mapRecords = {};
    
    if(map.students.length === 0 || (role === 'student' && map.lessons.length === 0)) { 
        console.log("Не має учнів/уроків"); 
        divJournal.innerHTML = '';
        checkedContentJournal.checked = false;
        return
    }

    map.grades.forEach(el => {
        if(!mapRecords[el.lastName]) mapRecords[el.lastName] = {};
        mapRecords[el.lastName][el.lessonNumber] = el.rating
    });
    renderTable(map.lessons, map.students, mapRecords, role);

    divJournal.addEventListener('click', function(event) {
        const target = event.target;
        if (target.dataset.lessonIndex !== undefined) {
            const index = Number(target.dataset.lessonIndex);
            const lessonInfo = map.lessons[index];

            if (checkedInfoDiv.checked) checkedInfoDiv.checked = false;
            checkedInfoDiv.disable = true;

            setTimeout(() => {
                checkedInfoDiv.checked = true;
                checkedInfoDiv.disable = false;
                console.log(lessonInfo);
            }, 1000);
        }
    });

    if (role === 'teacher') {
        divJournal.addEventListener('focus', function(event) {
            const cell = event.target;
            if (cell.dataset.student && cell.dataset.lesson) cell._oldValue = cell.textContent.trim();
        }, true);

        divJournal.addEventListener('keydown', function(event) {
            const cell = event.target;
            if (!cell.dataset.student || !cell.dataset.lesson) return;
            
            //Заборона Enter
            if (event.key === 'Enter') {
                event.preventDefault();
                cell.blur();
                return;
            }

            const isControlKey = event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab';
                     
            if (isControlKey) return;
            
            //Навігація стрілочка між комірками
            if (event.key.startsWith('Arrow')) {
                event.preventDefault();
                
                const currentCell = cell;
                const currentRow = currentCell.parentElement;
                const cellIndex = currentCell.cellIndex;
                
                let targetCell = null;
                
                if (event.key === 'ArrowRight') targetCell = currentCell.nextElementSibling; // Наступна комірка в цьому ж рядку
                else if (event.key === 'ArrowLeft') targetCell = currentCell.previousElementSibling; // Попередня комірка в цьому ж рядку
                else if (event.key === 'ArrowDown') { // Комірка знизу (наступний рядок, той самий стовпчик)
                    const nextRow = currentRow.nextElementSibling;
                    if (nextRow) targetCell = nextRow.cells[cellIndex];
                } else if (event.key === 'ArrowUp') { // Комірка зверху (попередній рядок, той самий стовпчик)
                    const prevRow = currentRow.previousElementSibling;
                    if (prevRow) targetCell = prevRow.cells[cellIndex];
                }
                
                // Якщо є куди переходити і ця комірка теж редагується
                if (targetCell && targetCell.dataset.student) {
                    targetCell.focus();
                    // Виділяємо весь текст в новій комірці
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(targetCell);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
                return;
            }

            //Обмежуємо довжину: якщо вже є 2 символи і виділеного тексту немає — блокуємо введення
            const selectedTextLength = window.getSelection().toString().length;
            if (cell.textContent.length >= 2 && selectedTextLength === 0) {
                event.preventDefault();
            }
        });

        // Забороняємо копіювання та вставлення
        divJournal.addEventListener('paste', function(event) {
            const cell = event.target;
            if (cell.dataset.student && cell.dataset.lesson) {
                event.preventDefault();
            }
        });

        //для мобільних пристроїв
        divJournal.addEventListener('input', function(event) {
            const cell = event.target;
            if (!cell.dataset.student || !cell.dataset.lesson) return;
            //Видаляємо пробіл та переноси рядків
            let text = cell.textContent.replace(/\s+/g, '');

            if (text.length > 2) text = text.slice(0, 2);
            // Якщо текст змінився після очищення — оновлюємо комірку і повертаємо курсор
            if (cell.textContent !== text) {
                cell.textContent = text;

                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(cell);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        });

        divJournal.addEventListener('blur', async function(event) {
            const cell = event.target;
            
            if (cell.dataset.student && cell.dataset.lesson) {
                const oldValue = cell._oldValue;
                //const newRating = cell.textContent.replace(/\s+/g, '');
                const newRating = cell.textContent.trim();
                
                if (oldValue === newRating) return; 
                const student = cell.dataset.student;
                const lesson = cell.dataset.lesson;

                const payload = {
                    action: 'updateRecord',
                    numberLesson: lesson,
                    rating: newRating,
                    subject: subject,
                    className: classes,
                    lastName: student
                };
                try {
                    const response = await request(payload);
                    console.log("Відповідь сервера:", response);
                    
                    cell._oldValue = newRating;
                    
                } catch (error) {
                    console.error("Помилка при збереженні оцінки:", error);
                    alert("Не вдалося зберегти оцінку. Перевірте з'єднання.");
                    cell.textContent = oldValue;
                }
            }
        }, true);
    }
};