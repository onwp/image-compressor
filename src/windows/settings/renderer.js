const compressionRate = document.getElementById('compressionRate');
const compressionValue = document.getElementById('compressionValue');
const savePath = document.getElementById('savePath');
const suffix = document.getElementById('suffix');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const browseBtn = document.getElementById('browseBtn');
const closeBtn = document.getElementById('closeBtn');
const themeSelect = document.getElementById('theme');

// Load current settings
async function loadSettings() {
  const settings = await window.electron.getSettings();
  compressionRate.value = settings.compressionRate;
  compressionValue.textContent = `${settings.compressionRate}%`;
  savePath.value = settings.savePath;
  suffix.value = settings.suffix;
  themeSelect.value = settings.theme || 'system';
  
  // Apply theme
  document.body.dataset.theme = themeSelect.value;
}

loadSettings();

// Update compression value display
compressionRate.addEventListener('input', (e) => {
  compressionValue.textContent = `${e.target.value}%`;
});

// Handle theme change
themeSelect.addEventListener('change', (e) => {
  document.body.dataset.theme = e.target.value;
});

// Handle close button
closeBtn.addEventListener('click', () => {
  window.close();
});

// Handle save button
saveBtn.addEventListener('click', async () => {
  try {
    const newSettings = {
      compressionRate: parseInt(compressionRate.value),
      savePath: savePath.value,
      suffix: suffix.value,
      theme: themeSelect.value
    };
    
    const success = await window.electron.saveSettings(newSettings);
    if (success) {
      window.close();
    } else {
      alert('Failed to save settings. Please try again.');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('An error occurred while saving settings.');
  }
});

// Handle cancel button
cancelBtn.addEventListener('click', () => {
  window.close();
});

// Handle browse button
browseBtn.addEventListener('click', async () => {
  const result = await window.electron.showDirectoryPicker();
  if (result) {
    savePath.value = result;
  }
}); 