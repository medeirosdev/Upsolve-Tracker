const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    isElectron: true,

    // Electron Store API
    store: {
        get: (key) => ipcRenderer.invoke('store:get', key),
        set: (key, value) => ipcRenderer.invoke('store:set', key, value),
        delete: (key) => ipcRenderer.invoke('store:delete', key),
        clear: () => ipcRenderer.invoke('store:clear'),
        getAll: () => ipcRenderer.invoke('store:getAll'),
    },
});
