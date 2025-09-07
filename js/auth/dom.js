// Авторське право (c) серпень 2025 рік Сікан Іван Валерійович.
const button = document.getElementById('loginButton');
const defaultText = button.querySelector('.default-text')
const dots = button.querySelector('.dots');
const errorMessage = document.getElementById('errorMessage');

export function setButtonState(isLoading, text = "Увійти") {
    if (isLoading) {
        defaultText.classList.add('hidden');
        dots.classList.remove('hidden');
        button.disabled = true;
        button.classList.add('active-animation');
    } else {
        defaultText.classList.remove('hidden');
        dots.classList.add('hidden');
        button.disabled = false;
        defaultText.textContent = text;
        button.classList.remove('active-animation');
    }
}

export function displayErrorMessage(message) {
    errorMessage.textContent = message;
}

export function clearErrorMessage() {
    errorMessage.textContent = '';
}

