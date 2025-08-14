const scriptURL = 'https://script.google.com/macros/s/AKfycbzFZ4O4eUHeZd1oDz00Mu--0SjZbhxQ5b4-DHdBqDzLq0zS4SzfG_PlYNLGHMXxAvu6NA/exec';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();

    const lastName = document.getElementById('lastName').value;
    const password = document.getElementById('password').value;

    fetch(scriptURL, {
      method: 'POST',
      body: JSON.stringify({ lastName, password }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('message').textContent = data.message || 'Успішний вхід!';
    })
    .catch(error => {
      document.getElementById('message').textContent = 'Помилка: ' + error.message;
    });
  });
});

