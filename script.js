// Configuration
const API_URL = 'https://anne-io.onrender.com'; // Your Render Backend
const CHAT_FEED = document.getElementById('chat-feed');
const INPUT_FIELD = document.getElementById('user-input');
const SEND_BTN = document.getElementById('send-btn');
const REFRESH_BTN = document.getElementById('refresh-btn');

// --- Helper Functions ---

function scrollToBottom() {
    CHAT_FEED.scrollTop = CHAT_FEED.scrollHeight;
}

function createMessageElement(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = text;

    const meta = document.createElement('div');
    meta.classList.add('msg-meta');
    
    // "Copy" button
    const copyBtn = document.createElement('span');
    copyBtn.classList.add('copy-btn');
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 1500);
    });

    meta.appendChild(copyBtn);
    msgDiv.appendChild(bubble);
    msgDiv.appendChild(meta);

    return msgDiv;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.classList.add('typing-indicator', 'message', 'bot');
    typingDiv.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    CHAT_FEED.appendChild(typingDiv);
    scrollToBottom();
}

function removeTyping() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// --- Main Logic ---

async function handleSendMessage() {
    const text = INPUT_FIELD.value.trim();
    if (!text) return;

    // 1. Add User Message to UI
    CHAT_FEED.appendChild(createMessageElement(text, 'user'));
    INPUT_FIELD.value = '';
    scrollToBottom();

    // 2. Show Typing Indicator
    showTyping();

    // 3. Call Backend
    try {
        // NOTE: Adjust the 'body' below to match exactly what your API expects.
        // Common formats: { "message": text } or { "query": text } or { "text": text }
        const response = await fetch(API_URL, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text }) 
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        // NOTE: Adjust 'data.response' to match your API's return structure.
        // e.g., if your API returns { "reply": "Hi" }, change to data.reply
        const botReply = data.response || data.message || "I'm having trouble connecting right now.";

        removeTyping();
        CHAT_FEED.appendChild(createMessageElement(botReply, 'bot'));
        
    } catch (error) {
        console.error('Error:', error);
        removeTyping();
        CHAT_FEED.appendChild(createMessageElement("Sorry, I can't reach my brain server right now.", 'bot'));
    }

    scrollToBottom();
}

// --- Event Listeners ---

SEND_BTN.addEventListener('click', handleSendMessage);

INPUT_FIELD.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

REFRESH_BTN.addEventListener('click', () => {
    // Clear chat but keep the intro
    CHAT_FEED.innerHTML = `
        <div class="message bot intro">
            <div class="bubble">
                Hello! I'm Anne. I'm listening... what's on your mind?
            </div>
             <div class="msg-meta">
                <span class="copy-btn">Copy</span>
            </div>
        </div>
    `;
});
