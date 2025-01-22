const { contextBridge, ipcRenderer, dialog } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openSettings: () => ipcRenderer.invoke('open-settings'),
  getSettings: async () => {
    const settings = await ipcRenderer.invoke('get-settings');
    console.log('Got settings in preload:', settings);
    return settings;
  },
  saveSettings: async (settings) => {
    console.log('Saving settings in preload:', settings);
    return await ipcRenderer.invoke('save-settings', settings);
  },
  compressImages: (filePath) => ipcRenderer.invoke('compress-images', filePath),
  showDirectoryPicker: () => ipcRenderer.invoke('show-directory-picker')
}); 