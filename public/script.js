const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
 
form.addEventListener('submit', async function (e) {
  e.preventDefault();
 
  const userMessage = input.value.trim();
  if (!userMessage) return;
 
  appendMessage('user', userMessage);
  input.value = '';
 
  // Show a temporary "Thinking..." message and get a reference to the element
  const botMessageElement = appendMessage('bot', 'Thinking...');
  chatBox.scrollTop = chatBox.scrollHeight; // Ensure view scrolls to the placeholder
 
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
 
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
 
    const data = await response.json();
 
    if (data && data.result) {
      // Replace the "Thinking..." message with the AI's reply
      botMessageElement.textContent = data.result;
    } else {
      // Handle cases where the response is successful but doesn't contain the expected result
      botMessageElement.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Failed to fetch chat response:', error);
    // Handle network errors or failed requests
    botMessageElement.textContent = 'Failed to get response from server.';
  } finally {
    // Scroll to the bottom again to show the final message
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
 
/**
 * Appends a new message to the chat box.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The message content.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
