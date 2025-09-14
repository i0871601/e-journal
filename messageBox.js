// messageBox.js
import { getUserData } from './js/config.js';

const messageBoxHTML = `
  <div id="message-box">
    <div id="message-text"></div>
    <div id="message-icon"></div>
  </div>`;
//для фото aspect-ratio: 1 / 1;
const messageBoxStyles = `
  #message-box {
    display: flex;
    flex-direction: row-reverse;
    /*background-color: #151419;*/
    position: absolute;
    right: 0;
    top: 3vmin;
    width: 0%;
    height: 7%;
    opacity: 0;
    transition: width 0.5s ease-in-out, opacity 0.5s ease-in-out;
    /*transition: background-color 0.5s ease-in-out, width 0.5s ease-in-out, opacity 0.5s ease-in-out;*/
    overflow: hidden;
  }
  #message-text p{
    white-space: nowrap;
    overflow: hidden;
    padding: 0;
    margin: 0;
    opacity: 0;
  }
  #message-box.show-message-box {
    width: 45%;
    opacity: 1;
  }
  #message-box.show-message-box #message-text p {
    opacity: 1;
  }
  #message-icon{
    display: none;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 50px;
    opacity: 0;
    background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjEzMS4wNTQgMjk2LjMwMiA2OTUuNjM1IDM2OS4xOTkiIHdpZHRoPSI2OTUuNjM1cHQiIGhlaWdodD0iMzY5LjE5OXB0Ij48cGF0aCBkPSJNIDEzMTAuNTQgNTUxMS43MiBMIDEzMTAuNTQgMzk4Ni40NiBMIDI3MjcuNDcgMzk4Ni40NiBMIDQxNDcuMjUgMzk4Ni40NiBMIDQ0NjYuNTUgMzY2Ny4xNSBMIDQ3ODguNzEgMzM0NC45OSBMIDUxMTAuODcgMzY2Ny4xNSBMIDU0MzAuMTggMzk4Ni40NiBMIDY4NDkuOTYgMzk4Ni40NiBMIDgyNjYuODkgMzk4Ni40NiBMIDgyNjYuODkgNTUxMS43MiBMIDgyNjYuODkgNzAzNi45OCBMIDQ3ODguNzEgNzAzNi45OCBMIDEzMTAuNTQgNzAzNi45OCBMIDEzMTAuNTQgNTUxMS43MiBaIE0gMjU5OS4xOCA2MTkwLjI0IEwgMjg1MC4wNiA1OTM5LjM2IEwgMzEwNi42NCA2MTk1Ljk0IEwgMzM2My4yMyA2NDUyLjUzIEwgMzU3Ny4wNSA2MjM4LjcxIEwgMzc5MC44NyA2MDI0Ljg4IEwgMzUzNC4yOSA1NzY4LjMgTCAzMjc3LjcgNTUxMS43MiBMIDM1MzQuMjkgNTI1NS4xNCBMIDM3OTAuODcgNDk5OC41NCBMIDM1ODIuNzUgNDc5MC40MiBMIDMzNzcuNDkgNDU4NS4xNiBMIDMxMjAuODkgNDg0MS43NCBMIDI4NjQuMzEgNTA5OC4zMiBMIDI2MDcuNzMgNDg0MS43NCBMIDIzNTEuMTQgNDU4NS4xNiBMIDIxMzcuMzIgNDc5OC45NyBMIDE5MjMuNDkgNTAxMi44IEwgMjE4MC4wOCA1MjY5LjM4IEwgMjQzNi42NyA1NTI1Ljk3IEwgMjE4MC4wOCA1NzgyLjU2IEwgMTkyMy40OSA2MDM5LjE0IEwgMjEyMy4wNyA2MjM4LjcxIEMgMjIzMS40IDYzNDcuMDQgMjMyOC4zNCA2NDM4LjI4IDIzMzYuODggNjQzOC4yOCBDIDIzNDIuNTggNjQzOC4yOCAyNDYyLjMzIDYzMjcuMSAyNTk5LjE4IDYxOTAuMjQgWiBNIDY0NzYuNDggNjE5MC4yNCBMIDY3MjcuMzYgNTkzOS4zNiBMIDY5ODMuOTUgNjE5NS45NCBMIDcyNDAuNTMgNjQ1Mi41MyBMIDc0NDUuODEgNjI0NC40MSBMIDc2NTMuOTIgNjAzOS4xNCBMIDczOTcuMzQgNTc4Mi41NiBMIDcxNDAuNzYgNTUyNS45NyBMIDczOTcuMzQgNTI2OS4zOCBMIDc2NTMuOTIgNTAxMi44IEwgNzQ0MC4wOSA0Nzk4Ljk3IEwgNzIyNi4yOCA0NTg1LjE2IEwgNjk2OS43IDQ4NDEuNzQgTCA2NzEzLjEgNTA5OC4zMiBMIDY0NTYuNTIgNDg0MS43NCBMIDYxOTkuOTQgNDU4NS4xNiBMIDU5OTQuNjcgNDc5MC40MiBMIDU3ODYuNTQgNDk5OC41NCBMIDYwNDMuMTIgNTI1NS4xNCBMIDYyOTkuNzIgNTUxMS43MiBMIDYwNDMuMTIgNTc2OC4zIEwgNTc4Ni41NCA2MDI0Ljg4IEwgNTk5MS44MiA2MjMwLjE2IEMgNjEwNS44NSA2MzQ0LjE5IDYyMDUuNjQgNjQzOC4yOCA2MjE0LjE4IDY0MzguMjggQyA2MjE5LjkgNjQzOC4yOCA2MzM5LjYzIDYzMjcuMSA2NDc2LjQ4IDYxOTAuMjQgWiBNIDUwNzMuODEgNTA5OC4zMiBMIDUwNzMuODEgNDQ5OS42MiBMIDQ3ODguNzEgNDQ5OS42MiBMIDQ1MDMuNjIgNDQ5OS42MiBMIDQ1MDMuNjIgNTA5OC4zMiBMIDQ1MDMuNjIgNTY5Ny4wMiBMIDQ3ODguNzEgNTY5Ny4wMiBMIDUwNzMuODEgNTY5Ny4wMiBMIDUwNzMuODEgNTA5OC4zMiBaIiBzdHlsZT0iIiBpZD0ib2JqZWN0LTAiIHRyYW5zZm9ybT0ibWF0cml4KDAuMTAwMDAwMDAxNDkwMTE2MTIsIDAsIDAsIC0wLjEwMDAwMDAwMTQ5MDExNjEyLCAtMS40MjEwODU0NzE1MjAyMDA0ZS0xNCwgMTAwMCkiLz48L3N2Zz4=');
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
  }
  #message-box.show-message-box #message-icon{
    display: flex;
    opacity: 1;
  }
`;

let messageBoxTimeoutId = null;

function initializeMessageBox() {
  const bodyElement = document.body;
  if (!bodyElement) return;

  const styleTag = document.createElement('style');
  styleTag.textContent = messageBoxStyles;
  document.head.appendChild(styleTag);

  bodyElement.insertAdjacentHTML('afterbegin', messageBoxHTML);
}

export function MessageText(text, status = 'default') {
  const messageBox = document.getElementById('message-box');
  if (messageBox) {
    const messageTextElement = document.getElementById('message-text');

    messageBox.classList.remove('message-box--success', 'message-box--error');
    // Логіка для зміни класів залежно від статусу (success/error)
    if (status === 'success') {
      messageBox.classList.add('message-box--success');
    } else if (status === 'error') {
      messageBox.classList.add('message-box--error');
    }

    if (messageBoxTimeoutId !== null) {
      clearTimeout(messageBoxTimeoutId);
      messageBoxTimeoutId = null;
    }

    if (messageTextElement) {
      let pTag = messageTextElement.querySelector('p');
      if (!pTag) {
        pTag = document.createElement('p');
        messageTextElement.appendChild(pTag);
      }
      pTag.textContent = text;

      messageBox.classList.add('show-message-box');

      messageBoxTimeoutId = setTimeout(() => {
        messageBox.classList.remove('show-message-box');
        messageBox.classList.remove('message-box--success', 'message-box--error');
        if (pTag) {
          pTag.textContent = '';
        }
      }, 3000);
    }
  }
}

function FonColor() {
  const messageBox = document.getElementById('message-box');
  const svgObject = document.getElementById('message-icon');
  if (!messageBox || !svgObject) {
    return;
  }

  const toggleSchedule = document.getElementById('toggle-schedule');
  const toggleJournal = document.getElementById('toggle-journal');
  
  // Перевірка, чи існують елементи
  if (!toggleSchedule || !toggleJournal) {
    return;
  }
  
  if (toggleSchedule.checked || toggleJournal.checked) {
    messageBox.style.backgroundColor = '#151419';
    // Примітка: 'style.fill' не працює для background-image, тому цей рядок краще видалити
    // svgObject.style.fill = '#fbfbfb'; 
  } else {
    messageBox.style.backgroundColor = '#fbfbfb';
    // svgObject.style.fill = '#151419'; 
  }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMessageBox();
    FonColor();

    const user = getUserData();
    if(user){
      const textIDuser = `Увійшов ${user.firstName} ${user.lastName}`;
      setTimeout(() => { MessageText(textIDuser, 'success');}, 2000);
    }

    // Отримання посилань на перемикачі
    const toggleSchedule = document.getElementById('toggle-schedule');
    const toggleJournal = document.getElementById('toggle-journal');
    
    // Додавання слухачів подій
    if (toggleSchedule) {
      toggleSchedule.addEventListener('change', FonColor);
    }
    if (toggleJournal) {
      toggleJournal.addEventListener('change', FonColor);
    }
});
export {FonColor};


