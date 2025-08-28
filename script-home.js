//Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
document.addEventListener('DOMContentLoaded', () => {
    const allCheckboxes = document.querySelectorAll('.toggle-checkbox');
    
    // Один гнучкий об'єкт для відстеження завантажених скриптів
    const loadedScripts = {};
    
    // Функція для динамічного завантаження JavaScript-файлів
    const loadScript = (src) => {
        if (loadedScripts[src]) {
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        
        script.onload = () => {
            loadedScripts[src] = true;
        };
        document.body.appendChild(script);
    };

    // Додаємо обробник події 'change' до кожного чекбокса
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            let scriptSrc;

            if (event.target.id === 'toggle-schedule') {
                scriptSrc = 'schedule_script.js';
            } else {
                scriptSrc = sessionStorage.getItem('scriptName');
            }
            
            if (isChecked) {
                // Якщо цей чекбокс активовано, знімаємо позначку з інших
                allCheckboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== event.target) {
                        otherCheckbox.checked = false;
                    }
                });
                // Завантажуємо відповідний скрипт
                loadScript(scriptSrc);
            }
        });
    });
});