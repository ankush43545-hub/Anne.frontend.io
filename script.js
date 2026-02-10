// FIXED: Added '/chat' to the URL
const API_URL = 'https://anne-io.onrender.com/chat'; 

const feed = document.getElementById('chat-feed');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
let history = []; // To keep conversation context

// Helper: Scroll
const scroll = () => feed.scrollTo(0, feed.scrollHeight);

// Helper: Add Message
function addMsg(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    
    if(sender === 'bot') {
        const copy = document.createElement('div');
        copy.className = 'copy-btn';
        copy.innerText = 'Copy';
        copy.onclick = () => { navigator.clipboard.writeText(text); copy.innerText = 'Copied'; };
        div.appendChild(copy);
    }
    
    feed.appendChild(div);
    scroll();
}

// Helper: Typing
let typingDiv;
function showTyping() {
    typingDiv = document.createElement('div');
    typingDiv.className = 'typing';
    typingDiv.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    feed.appendChild(typingDiv);
    scroll();
}
function hideTyping() { if(typingDiv) typingDiv.remove(); }

// Main Send Logic
async function send() {
    const text = input.value.trim();
    if (!text) return;

    // 1. Show User Message
    addMsg(text, 'user');
    input.value = '';
    showTyping();

    // 2. Add to History
    history.push({ role: "user", content: text });

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: text,
                history: history 
            })
        });

        if (!res.ok) throw new Error('Server Error');

        const data = await res.json();
        
        // FIXED: Using 'data.reply' because app.py returns {"reply": ...}
        const botReply = data.reply || "Connected, but empty reply.";
        
        hideTyping();
        addMsg(botReply, 'bot');
        
        // Update history
        history.push({ role: "assistant", content: botReply });

    } catch (err) {
        console.error(err);
        hideTyping();
        addMsg("Connection failed. (Check Console)", 'bot');
    }
}

sendBtn.onclick = send;
input.onkeypress = (e) => { if(e.key === 'Enter') send(); };
document.getElementById('refresh-btn').onclick = () => { feed.innerHTML = ''; history = []; };
  
