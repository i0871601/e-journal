const apiURL = "https://script.google.com/macros/s/AKfycbzIRByiKc4nfm87GG2vXION_g86xfWem7nA-zf-bDo1EcEiY1WfIoZbUCQQkTKlVFd5fw/exec";

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
      messageDiv.textContent = `Увійшов ${data.firstName}!`;
      // Тут логіка переходу або інша
    } else {
      messageDiv.textContent = "Помилка: " + data.message;
    }
  })
  .catch(error => {
    messageDiv.textContent = "Помилка: " + error.message;
  });
});



