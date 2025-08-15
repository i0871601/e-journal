const apiURL = "https://script.google.com/macros/s/AKfycbzIRByiKc4nfm87GG2vXION_g86xfWem7nA-zf-bDo1EcEiY1WfIoZbUCQQkTKlVFd5fw/exec";

const form = document.getElementById('loginForm');
const button = document.getElementById('loginButton');
const defaultText = button.querySelector('.default-text');
const dots = button.querySelector('.dots');
const messageDiv = document.getElementById('message');


form.addEventListener('submit', function(event){
  event.preventDefault();

  const lastName = document.getElementById('lastName').value.trim();
  const password = document.getElementById('password').value.trim();

  //Показ кружків(анімація)
  defaultText.style.display = 'none';
  dots.style.display = 'inline-block';
  //defaultText.classList.add('none');
  //dots.classList.remove('hidden');
  button.disabled = true;

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
  })
  .finally(() => {
    //Повернути кнопку до звичайного вигляду
    defaultText.classList.add('none');
    dots.classList.remove('hidden');
    //defaultText.classList.remove('hidden');
    //dots.classList.add('hidden');
    button.disabled = false;
  });
});






