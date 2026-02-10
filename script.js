const API_URL = 'https://anne-io.onrender.com'; 
const CHAT_FEED = document.getElementById('chat-feed');
const INPUT_FIELD = document.getElementById('user-input');
const SEND_BTN = document.getElementById('send-btn');

// Auto-scroll
const scrollToBottom = () => {
    CHAT_FEED.scrollTop = CHAT_FEED.scrollHeight;
};

// Message Creator
function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;

    // Small copy option
    if (sender === 'bot') {
        const copyBtn = document.createElement('div');
        copyBtn.classList.add('copy-trigger');
        copyBtn.innerText = 'Copy';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(text);
            copyBtn.innerText = 'Copied';
        };
        msgDiv.appendChild(copyBtn);
    }

    CHAT_FEED.appendChild(msgDiv);
    scrollToBottom();
}

// Typing Indicator
let typingDiv = null;
function showTyping() {
    if (typingDiv) return;
    typingDiv = document.createElement('div');
    typingDiv.classList.add('typing');
    typingDiv.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    CHAT_FEED.appendChild(typingDiv);
    scrollToBottom();
}

function removeTyping() {
    if (typingDiv) {
        typingDiv.remove();
        typingDiv = null;
    }
}

// Send Logic
async function sendMessage() {
    const text = INPUT_FIELD.value.trim();
    if (!text) return;

    // 1. UI Updates
    addMessage(text, 'user');
    INPUT_FIELD.value = '';
    showTyping();

    // 2. Backend Call
    try {
        // NOTE: Attempting standard Fetch. 
        // If this fails with "Failed to fetch", it is a CORS error on the Render server.
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }) // Trying 'message' key first
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Support multiple common JSON return keys (response, reply, message, text)
        const botText = data.response || data.reply || data.message || data.text || "Connected, but no text returned.";
        
        removeTyping();
        addMessage(botText, 'bot');

    } catch (error) {
        console.error("Connection Failed:", error);
        removeTyping();
        addMessage("Error: I can't reach the server. (Check Console for CORS/Network details)", 'bot');
    }
}

// Listeners
SEND_BTN.addEventListener('click', sendMessage);
INPUT_FIELD.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
document.getElementById('refresh-btn').addEventListener('click', () => {
    CHAT_FEED.innerHTML = '';
});
