window.addEventListener('DOMContentLoaded', () => {
  const viewButton = document.getElementById('view');
  const buttonText = localStorage.getItem('buttonText');
  if (viewButton && buttonText) {
    viewButton.textContent = buttonText; // Встановлюємо текст кнопки
  }
});