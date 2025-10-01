// Shared notification system for all pages
function createNotificationPopup() {
  // Check if popup already exists
  if (document.getElementById('notification-popup')) {
    return;
  }

  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'notification-popup';
  popup.className = 'notification-popup';
  
  // Create message element
  const message = document.createElement('div');
  message.className = 'notification-message';
  
  // Create close button
  const closeBtn = document.createElement('span');
  closeBtn.className = 'notification-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = hideNotification;
  
  // Assemble popup
  popup.appendChild(message);
  popup.appendChild(closeBtn);
  
  // Add to document
  document.body.appendChild(popup);
  
  // Add CSS if not already in your style.css
  const style = document.createElement('style');
  style.textContent = `
    .notification-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      padding: 1.5rem;
      z-index: 2000;
      min-width: 300px;
      max-width: 80%;
      display: none;
      text-align: center;
      animation: fadeIn 0.3s ease-out;
    }
    
    .notification-success {
      border-top: 5px solid #2ecc71;
    }
    
    .notification-error {
      border-top: 5px solid #e74c3c;
    }
    
    .notification-warning {
      border-top: 5px solid #f39c12;
    }
    
    .notification-message {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    
    .notification-close {
      position: absolute;
      top: 0.5rem;
      right: 1rem;
      font-size: 1.5rem;
      cursor: pointer;
      color: #777;
    }
    
    .notification-close:hover {
      color: #333;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -60%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }
  `;
  document.head.appendChild(style);
}

// Show notification
function showNotification(message, type = 'success') {
  // Create popup if it doesn't exist
  createNotificationPopup();
  
  const popup = document.getElementById('notification-popup');
  const messageEl = popup.querySelector('.notification-message');
  
  // Set message and type
  messageEl.textContent = message;
  popup.className = 'notification-popup';
  popup.classList.add(`notification-${type}`);
  
  // Show popup
  popup.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(hideNotification, 3000);
}

// Hide notification
function hideNotification() {
  const popup = document.getElementById('notification-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// Show confirmation dialog (replaces window.confirm)
function showConfirm(message) {
  return new Promise((resolve) => {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'confirm-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 2500;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      padding: 2rem;
      min-width: 300px;
      max-width: 500px;
      text-align: center;
      animation: fadeIn 0.3s ease-out;
    `;

    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
      line-height: 1.5;
    `;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 1rem;
      justify-content: center;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annuler';
    cancelBtn.style.cssText = `
      padding: 0.5rem 1.5rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    `;
    cancelBtn.onmouseover = () => cancelBtn.style.backgroundColor = '#5a6268';
    cancelBtn.onmouseout = () => cancelBtn.style.backgroundColor = '#6c757d';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirmer';
    confirmBtn.style.cssText = `
      padding: 0.5rem 1.5rem;
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    `;
    confirmBtn.onmouseover = () => confirmBtn.style.backgroundColor = '#c0392b';
    confirmBtn.onmouseout = () => confirmBtn.style.backgroundColor = '#e74c3c';

    const closeDialog = (result) => {
      document.body.removeChild(backdrop);
      resolve(result);
    };

    cancelBtn.onclick = () => closeDialog(false);
    confirmBtn.onclick = () => closeDialog(true);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) closeDialog(false);
    };

    buttonsContainer.appendChild(cancelBtn);
    buttonsContainer.appendChild(confirmBtn);
    dialog.appendChild(messageEl);
    dialog.appendChild(buttonsContainer);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    // Focus confirm button
    confirmBtn.focus();
  });
}

// Show prompt dialog (replaces window.prompt)
function showPrompt(message, defaultValue = '') {
  return new Promise((resolve) => {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'prompt-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 2500;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      padding: 2rem;
      min-width: 300px;
      max-width: 500px;
      text-align: center;
      animation: fadeIn 0.3s ease-out;
    `;

    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      margin-bottom: 1rem;
      font-size: 1.1rem;
      line-height: 1.5;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue;
    input.style.cssText = `
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    `;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 1rem;
      justify-content: center;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annuler';
    cancelBtn.style.cssText = `
      padding: 0.5rem 1.5rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    `;
    cancelBtn.onmouseover = () => cancelBtn.style.backgroundColor = '#5a6268';
    cancelBtn.onmouseout = () => cancelBtn.style.backgroundColor = '#6c757d';

    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.style.cssText = `
      padding: 0.5rem 1.5rem;
      background-color: #2ecc71;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    `;
    okBtn.onmouseover = () => okBtn.style.backgroundColor = '#27ae60';
    okBtn.onmouseout = () => okBtn.style.backgroundColor = '#2ecc71';

    const closeDialog = (result) => {
      document.body.removeChild(backdrop);
      resolve(result);
    };

    cancelBtn.onclick = () => closeDialog(null);
    okBtn.onclick = () => closeDialog(input.value);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) closeDialog(null);
    };

    // Allow Enter key to submit
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        closeDialog(input.value);
      }
    };

    buttonsContainer.appendChild(cancelBtn);
    buttonsContainer.appendChild(okBtn);
    dialog.appendChild(messageEl);
    dialog.appendChild(input);
    dialog.appendChild(buttonsContainer);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    // Focus input
    input.focus();
    input.select();
  });
}
