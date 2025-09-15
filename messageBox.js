// messageBox.js
import { getUserData } from './js/config.js';

const messageBoxHTML = `
  <div id="message-box">
    <div id="message-text"><p></p></div>
    <div id="message-icon">
      <?xml version="1.0" encoding="utf-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="131.054 296.302 695.635 369.199" width="695.635pt" height="369.199pt">
        <path d="M 1310.54 5511.72 L 1310.54 3986.46 L 2727.47 3986.46 L 4147.25 3986.46 L 4466.55 3667.15 L 4788.71 3344.99 L 5110.87 3667.15 L 5430.18 3986.46 L 6849.96 3986.46 L 8266.89 3986.46 L 8266.89 5511.72 L 8266.89 7036.98 L 4788.71 7036.98 L 1310.54 7036.98 L 1310.54 5511.72 Z M 2599.18 6190.24 L 2850.06 5939.36 L 3106.64 6195.94 L 3363.23 6452.53 L 3577.05 6238.71 L 3790.87 6024.88 L 3534.29 5768.3 L 3277.7 5511.72 L 3534.29 5255.14 L 3790.87 4998.54 L 3582.75 4790.42 L 3377.49 4585.16 L 3120.89 4841.74 L 2864.31 5098.32 L 2607.73 4841.74 L 2351.14 4585.16 L 2137.32 4798.97 L 1923.49 5012.8 L 2180.08 5269.38 L 2436.67 5525.97 L 2180.08 5782.56 L 1923.49 6039.14 L 2123.07 6238.71 C 2231.4 6347.04 2328.34 6438.28 2336.88 6438.28 C 2342.58 6438.28 2462.33 6327.1 2599.18 6190.24 Z M 6476.48 6190.24 L 6727.36 5939.36 L 6983.95 6195.94 L 7240.53 6452.53 L 7445.81 6244.41 L 7653.92 6039.14 L 7397.34 5782.56 L 7140.76 5525.97 L 7397.34 5269.38 L 7653.92 5012.8 L 7440.09 4798.97 L 7226.28 4585.16 L 6969.7 4841.74 L 6713.1 5098.32 L 6456.52 4841.74 L 6199.94 4585.16 L 5994.67 4790.42 L 5786.54 4998.54 L 6043.12 5255.14 L 6299.72 5511.72 L 6043.12 5768.3 L 5786.54 6024.88 L 5991.82 6230.16 C 6105.85 6344.19 6205.64 6438.28 6214.18 6438.28 C 6219.9 6438.28 6339.63 6327.1 6476.48 6190.24 Z M 5073.81 5098.32 L 5073.81 4499.62 L 4788.71 4499.62 L 4503.62 4499.62 L 4503.62 5098.32 L 4503.62 5697.02 L 4788.71 5697.02 L 5073.81 5697.02 L 5073.81 5098.32 Z" style="" id="object-0" transform="matrix(0.10000000149011612, 0, 0, -0.10000000149011612, -1.4210854715202004e-14, 1000)"/>
      </svg>
    </div>
  </div>`;
//для фото aspect-ratio: 1 / 1;
const messageBoxStyles = `
  #message-box {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    position: absolute;
    right: 0;
    top: 3vmin;
    width: auto;
    max-width: 0;
    height: 50px;
    padding-left: 5.5vmin;
    padding-right: 3vmin;
    border-radius: 1000px 0 0 1000px;
    gap: 5vmin;
    opacity: 0;
    transition: max-width 0.7s ease-in-out, opacity 0.7s ease-in-out;
    overflow: hidden;
  }
  #message-text{
    display: flex;
    align-items: center;
    padding-bottom: 2.5%;
  }
  #message-text p{
    white-space: nowrap;
    overflow: hidden;
    padding: 0;
    margin: 0;
    opacity: 0;
    transition: opacity 0.7s ease-in-out;
  }
  #message-box.show-message-box {
    max-width: 45vw;
    opacity: 1;
  }
  #message-box.show-message-box #message-text p {
    opacity: 1;
  }
  #message-icon{
    display: flex;
    align-items: center;
    height: 100%;
    width: clamp(40px, 8vmin, 90px);
    opacity: 0;
    transition: opacity 0.7s ease-in-out;
  }
  #message-icon svg{
    box-sizing: content-box;
  }
  #message-box.show-message-box #message-icon{
    opacity: 1;
  }
  
  @media (orientation: portrait){
    #message-box{
      height: clamp(50px, 10vmin, 100px);
    }
    #message-box.show-message-box{
      max-width: 87vw;
    }
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
      pTag.textContent = text;

      messageBox.classList.add('show-message-box');

      messageBoxTimeoutId = setTimeout(() => {
        messageBox.classList.remove('show-message-box');
        messageBox.classList.remove('message-box--success', 'message-box--error');
      }, 3000);
      pTag.textContent = '';
    }
  }
}

function FonColor() {
  const messageBox = document.getElementById('message-box');
  const svgObject = document.querySelector('#message-icon svg');
  const pText = document.querySelector('#message-text p');
  if (!messageBox || !svgObject) {
    return;
  }

  const toggleSchedule = document.getElementById('toggle-schedule');
  const toggleJournal = document.getElementById('toggle-journal');
  
  if ((toggleSchedule && toggleSchedule.checked) || (toggleJournal && toggleJournal.checked)) {
    messageBox.style.backgroundColor = '#151419';
    svgObject.style.fill = '#fbfbfb'; 
    pText.style.color = '#fbfbfb';
  } else {
    messageBox.style.backgroundColor = '#fbfbfb';
    svgObject.style.fill = '#151419'; 
    pText.style.color = '#151419';
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


































