document.addEventListener("DOMContentLoaded", function() {
  const role = localStorage.getItem('role');
  const buttonText = localStorage.getItem('buttonText');
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');
  const classOrSubject = role === 'student' ? localStorage.getItem('class') : localStorage.getItem('subject');
  
  const viewButton = document.getElementById('view');
  viewButton.textContent = buttonText;

});