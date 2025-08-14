const apiURL = "https://script.google.com/macros/s/AKfycbzFZ4O4eUHeZd1oDz00Mu--0SjZbhxQ5b4-DHdBqDzLq0zS4SzfG_PlYNLGHMXxAvu6NA/exec";

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const lastName = document.getElementById('lastName').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageDiv = document.getElementById('message');

  messageDiv.textContent = "Завантаження...";

  fetch(`${apiURL}?lastName=${encodeURIComponent(lastName)}&password=${encodeURIComponent(password)}`, {
    method: 'GET',
    mode: 'cors'
  })
  .then(response => {
    if (!response.ok) throw new Error("Помилка мережі");
    return response.json();
  })
  .then(data => {
    if (data.success) {
      messageDiv.textContent = "Успішний вхід!";
      // Тут можна додати логіку для переходу в систему
    } else {
      messageDiv.textContent = "Помилка: " + data.message;
    }
  })
  .catch(error => {
    messageDiv.textContent = "Помилка: " + error.message;
  });
});


