// Load configuration on page load
async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    document.getElementById('apiKey').value = config.apiKey || '';
    document.getElementById('tenantId').value = config.tenantId || '';
    document.getElementById('channelId').value = config.channelId || '';
    document.getElementById('apiBase').value = config.apiBase || '';
  } catch (err) {
    console.error('Failed to load config:', err);
  }
}

// Save configuration
document.getElementById('configForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageDiv = document.getElementById('configMessage');
  messageDiv.innerHTML = '';
  
  try {
    const apiKey = document.getElementById('apiKey').value;
    const config = {
      apiKey: apiKey.includes('••••') ? undefined : apiKey, // Don't send masked key
      tenantId: document.getElementById('tenantId').value,
      channelId: document.getElementById('channelId').value,
      apiBase: document.getElementById('apiBase').value
    };
    
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    
    const result = await res.json();
    if (res.ok) {
      messageDiv.innerHTML = '<div class="success">✓ Configuration saved successfully!</div>';
      if (result.config.apiKey) {
        document.getElementById('apiKey').value = result.config.apiKey;
      }
    } else {
      messageDiv.innerHTML = '<div class="error">✗ Failed to save configuration: ' + (result.error || 'Unknown error') + '</div>';
    }
  } catch (err) {
    messageDiv.innerHTML = '<div class="error">✗ Error: ' + err.message + '</div>';
  }
});

// Create a new gift card
document.getElementById('createGiftCardForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageDiv = document.getElementById('createMessage');
  messageDiv.innerHTML = '';

  try {
    const giftCard = {
      initial_value: Math.round(parseFloat(document.getElementById('initialValue').value)),
      passcode: document.getElementById('code').value,
    };

    const res = await fetch('/api/gift-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(giftCard)
    });

    const result = await res.json();
    if (res.ok) {
      const riseId = result.rise?.giftCard?.id || 'N/A';
      messageDiv.innerHTML = `<div class="success">✓ Gift card created successfully! Rise ID: ${riseId}</div>`;
      document.getElementById('createGiftCardForm').reset();
      setRandomCode();
      loadGiftCards(); // Refresh the list
    } else {
      messageDiv.innerHTML = '<div class="error">✗ Failed to create gift card: ' + (result.error || 'Unknown error') + '</div>';
    }
  } catch (err) {
    messageDiv.innerHTML = '<div class="error">✗ Error: ' + err.message + '</div>';
  }
});

// Load gift cards
async function loadGiftCards() {
  const container = document.getElementById('giftCardsContainer');
  container.innerHTML = '<div class="loading">Loading gift cards...</div>';
  
  try {
    const res = await fetch('/api/gift-cards');
    const data = await res.json();
    const giftCards = data.giftCards || [];
    
    if (giftCards.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="8" width="18" height="4" rx="1"/>
            <path d="M12 8v13"/>
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
          </svg>
          <p>No gift cards yet. Create one!</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = '<div class="gift-cards-list">' + giftCards.map(card => `
      <div class="gift-card-item">
        <div class="gift-card-header">
          <span class="gift-card-code">${escapeHtml(card.code || 'N/A')}</span>
          <span class="gift-card-status status-${card.status || 'active'}">${escapeHtml(card.status || 'active')}</span>
        </div>
        <div class="gift-card-details">
          <div class="detail-item">
            <span class="detail-label">Balance</span>
            <span class="detail-value balance">${formatCurrency(card.balance || 0, card.currency || 'USD')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Currency</span>
            <span class="detail-value">${escapeHtml(card.currency || 'USD')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Local ID</span>
            <span class="detail-value" style="font-size: 0.9em; font-family: monospace;">${escapeHtml(card.id || 'N/A')}</span>
          </div>
          ${card.riseGiftCardId ? `
            <div class="detail-item">
              <span class="detail-label">Rise ID</span>
              <span class="detail-value" style="font-size: 0.9em; font-family: monospace;">${escapeHtml(card.riseGiftCardId)}</span>
            </div>
          ` : ''}
        </div>
        ${card.riseGiftCardId ? '<div class="rise-sync-indicator">✓ Synced with Rise.ai</div>' : '<div style="color: #f59e0b; margin-top: 10px; font-size: 0.85em;">⚠ Not yet synced</div>'}
        <div class="balance-update-form">
          <input type="number" id="balance-${card.id}" placeholder="Amount (+/-)" step="0.01" />
          <button onclick="changeBalance('${card.code}', '${card.id}')">Change Balance</button>
        </div>
      </div>
    `).join('') + '</div>';
  } catch (err) {
    container.innerHTML = '<div class="error">Failed to load gift cards: ' + escapeHtml(err.message) + '</div>';
  }
}

async function changeBalance(code, cardId) {
  const deltaInput = document.getElementById(`balance-${cardId}`);
  const delta = parseFloat(deltaInput.value);

  if (isNaN(delta) || delta === 0) {
    alert('Please enter a valid non-zero amount.');
    return;
  }

  try {
    const res = await fetch(`/api/gift-cards/${code}/balance-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: delta })
    });

    if (res.ok) {
      alert('Balance updated successfully!');
      deltaInput.value = '';
      loadGiftCards();
    } else {
      const result = await res.json();
      alert('Failed to update balance: ' + (result.error || 'Unknown error'));
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setRandomCode() {
  const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  document.getElementById('code').value = randomCode;
}

// Initialize
loadConfig();
loadGiftCards();
setRandomCode();

// Auto-refresh every 30 seconds
setInterval(loadGiftCards, 30000);
