const { app, BrowserWindow, ipcMain, dialog, shell, clipboard, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const settingsManager = require('./src/utils/settings-manager');
const { compressImage } = require('./src/utils/compression');

let mainWindow;
let settingsWindow;

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// Initialize settings file path
const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

// Create default settings if not exists
function initSettings() {
  if (!fs.existsSync(settingsPath)) {
    const defaultSettings = {
      compressionRate: 80,
      savePath: app.getPath('downloads'),
      suffix: '-min',
      theme: 'system'
    };
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
  }
}

// Platform-specific window settings
function getPlatformWindowSettings() {
  switch (process.platform) {
    case 'darwin':
      return {
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 10, y: 10 }
      };
    case 'win32':
      return {
        frame: false
      };
    default:
      return {
        frame: false
      };
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    ...getPlatformWindowSettings()
  });

  mainWindow.loadFile('src/windows/main/index.html');
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    parent: mainWindow,
    modal: true,
    show: false,
    resizable: false
  });

  settingsWindow.loadFile('src/windows/settings/index.html');

  // Debug: Log when settings window is ready
  settingsWindow.webContents.on('did-finish-load', () => {
    console.log('Settings window loaded');
  });

  // Clean up the window when closed
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

app.whenReady().then(() => {
  initSettings();
  createMainWindow();

  // Set dock icon for macOS
  if (process.platform === 'darwin') {
    const iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'build', 'icon.png')
      : path.join(__dirname, 'build', 'icon.png');
    
    try {
      app.dock.setIcon(iconPath);
    } catch (error) {
      console.error('Failed to set dock icon:', error);
    }
  }
});

ipcMain.handle('open-settings', () => {
  createSettingsWindow();
  settingsWindow.show();
});

ipcMain.handle('get-settings', () => {
  try {
    const data = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings:', error);
    return null;
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    // Update settings in both the file and the settings manager
    const success = settingsManager.saveSettings(settings);
    if (!success) {
      throw new Error('Failed to save settings');
    }
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
});

ipcMain.handle('compress-images', async (event, filePath) => {
  try {
    // Get latest settings from the settings manager
    const settings = {
      compressionRate: parseInt(settingsManager.get('compressionRate')),
      savePath: settingsManager.get('savePath'),
      suffix: settingsManager.get('suffix')
    };

    // Ensure the save directory exists
    if (!fs.existsSync(settings.savePath)) {
      fs.mkdirSync(settings.savePath, { recursive: true });
    }
    
    return await compressImage(filePath, settings);
  } catch (error) {
    console.error('Error during compression:', error);
    return {
      success: false,
      fileName: path.basename(filePath),
      error: error.message
    };
  }
});

ipcMain.handle('show-directory-picker', async () => {
  const result = await dialog.showOpenDialog(settingsWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('open-path', async (event, path) => {
  try {
    await shell.showItemInFolder(path);
    return true;
  } catch (error) {
    console.error('Error opening path:', error);
    return false;
  }
});

ipcMain.handle('copy-file', async (event, filePath) => {
  try {
    // Read the image file
    const image = nativeImage.createFromPath(filePath);
    
    // Copy the image to clipboard
    clipboard.writeImage(image);
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle macOS activation
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Handle window controls for Windows/Linux
ipcMain.handle('minimize-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.handle('maximize-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
}); 