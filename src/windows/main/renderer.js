const dropZone = document.getElementById('dropZone');
const settingsBtn = document.getElementById('settingsBtn');
const resultsList = document.getElementById('resultsList');

// Handle settings button click
settingsBtn.addEventListener('click', () => {
  window.electron.openSettings();
});

// Handle file selection by clicking
dropZone.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };
  
  input.click();
});

// Handle drag and drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
  
  const files = Array.from(e.dataTransfer.files).filter(file => 
    file.type.startsWith('image/')
  );
  
  if (files.length > 0) {
    handleFiles(files);
  }
});

async function handleFiles(files) {
  const settings = await window.electron.getSettings();
  const results = document.getElementById('results');
  results.classList.remove('hidden');
  
  for (const file of files) {
    const result = await window.electron.compressImages(file.path);
    displayResult(result);
  }
}

function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Add at the top with other event handlers
async function openPath(path) {
  await window.electron.openPath(path);
}

async function copyToClipboard(path, button) {
  try {
    const success = await window.electron.copyFile(path);
    if (!success) throw new Error('Failed to copy file');
    
    // Visual feedback
    const originalText = button.innerHTML;
    button.classList.add('copied');
    button.textContent = 'Copied!';
    
    // Reset after 2 seconds
    setTimeout(() => {
      button.classList.remove('copied');
      button.innerHTML = originalText;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    // Show error feedback
    const originalText = button.innerHTML;
    button.style.color = '#f44336';
    button.textContent = 'Error!';
    
    setTimeout(() => {
      button.style.color = '';
      button.innerHTML = originalText;
    }, 2000);
  }
}

function displayResult(result) {
  const resultItem = document.createElement('div');
  resultItem.className = 'result-item';
  
  if (result.success) {
    const savings = ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1);
    resultItem.innerHTML = `
      <div class="file-info">
        <span class="filename">${result.fileName}</span>
        <div class="size-info">
          <span class="original-size">${formatFileSize(result.originalSize)}</span>
          <span class="arrow">-></span>
          <span class="compressed-size">${formatFileSize(result.compressedSize)}</span>
        </div>
        <div class="save-location">
          <span class="save-location-label">Saved to:</span>
          <span class="save-location-path">${result.savePath}</span>
          <div class="save-location-actions">
            <button class="action-button" title="Open folder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              Open
            </button>
            <button class="action-button" title="Copy path">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
          </div>
        </div>
      </div>
      <span class="savings">Reduced by ${savings}%</span>
    `;

    // Add event listeners for the buttons
    const openButton = resultItem.querySelector('.action-button[title="Open folder"]');
    const copyButton = resultItem.querySelector('.action-button[title="Copy path"]');

    openButton.addEventListener('click', () => openPath(result.savePath));
    copyButton.addEventListener('click', () => copyToClipboard(result.savePath, copyButton));
  } else {
    resultItem.innerHTML = `
      <span class="filename">${result.fileName}</span>
      <span class="error">Error: ${result.error}</span>
    `;
  }
  
  resultsList.appendChild(resultItem);
  document.getElementById('results').classList.remove('hidden');
}

// Apply theme on load and when settings change
async function applyTheme() {
  const settings = await window.electron.getSettings();
  document.body.dataset.theme = settings.theme || 'system';
  
  // Force repaint to ensure theme is applied
  document.body.style.display = 'none';
  document.body.offsetHeight; // Force reflow
  document.body.style.display = '';
}

// Apply theme immediately
applyTheme();

// Reapply theme when settings window closes
window.addEventListener('focus', applyTheme);

// Also apply theme when system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
  applyTheme();
});

// Add platform class to body
document.body.classList.add(process.platform); 