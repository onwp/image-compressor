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
      </div>
      <span class="savings">Reduced by ${savings}%</span>
    `;
  } else {
    resultItem.innerHTML = `
      <span class="filename">${result.fileName}</span>
      <span class="error">Error: ${result.error}</span>
    `;
  }
  
  resultsList.appendChild(resultItem);
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