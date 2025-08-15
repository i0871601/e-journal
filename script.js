const apiURL = "https://script.google.com/macros/s/AKfycbzIRByiKc4nfm87GG2vXION_g86xfWem7nA-zf-bDo1EcEiY1WfIoZbUCQQkTKlVFd5fw/exec";

const form = document.getElementById('loginForm');
const button = document.getElementById('loginButton');
const defaultText = button.querySelector('.default-text');
const dots = button.querySelector('.dots');
const errorMessage = document.getElementById('errorMessage');

//Функція авторизації
function authorizeUser(lastName, password){
  return fetch(`${apiURL}?lastName=${encodeURIComponent(lastName)}&password=${encodeURIComponent(password)}`, {
    method: 'GET',
    mode: 'cors'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      return data; //Повертає результат з інформацією про роль
    } else {
      throw new Error(data.message);
    }
  });
}

form.addEventListener('submit', function(event){
  event.preventDefault();

  const lastName = document.getElementById('lastName').value.trim();
  const password = document.getElementById('password').value.trim();

  //Скидання попередні повідомлення
  errorMessage.textContent = '';

  //Показ кружків(анімація)
  defaultText.classList.add('hidden');
  dots.classList.remove('hidden');
  button.disabled = true;
  authorizeUser(lastName, password)
  .then(data =>{
    if(data.role === 'student'){
      window.location.href = "Home-student.html";
    } 
    else if(data.role === 'teacher'){
      window.location.href = "Home-teacher.html";
    }
    
  })
  .catch(error => {
    errorMessage.textContent = "Помилка: " + error.message;
  })
  .finally(() => {
    //Повернути кнопку до звичайного вигляду
    defaultText.classList.remove('hidden');
    dots.classList.add('hidden');
    button.disabled = false;
  });
});











