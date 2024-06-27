const container = document.querySelector('.container');
const btns = document.querySelectorAll('.btn');
const imglist = ["agnihome.jpg", "agnihome2.png", "agnihome3.jpg"];
let index = 0;

btns.forEach((button) => {
    button.addEventListener('click', () => {
        if (button.classList.contains('btn-left')) {
            index--;
            if (index < 0) {
                index = imglist.length - 1;
            }
            container.style.background = `url("/images/${imglist[index]}") center/cover `;
        } else {
            index++;
            if (index === imglist.length) {
                index = 0;
            }
            container.style.background = `url("/images/${imglist[index]}") center/cover `;
        }
    });
});








// /js/chat.js
document.addEventListener('DOMContentLoaded', (event) => {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');

    function sendMessage() {
        const message = messageInput.value;
        if (message.trim() !== "") {
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messageElement.className = 'message';
            chatMessages.appendChild(messageElement);
            messageInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    window.sendMessage = sendMessage;

    // Simulated incoming message for demonstration
    setTimeout(() => {
        const messageElement = document.createElement('div');
        messageElement.textContent = "Welcome to the community chat!";
        messageElement.className = 'message';
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
});
