const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hub', {
  clearSession: (partition) => ipcRenderer.invoke('clear-session', partition),
  suggest: (apiKey, context) => ipcRenderer.invoke('ai-suggest', { apiKey, context }),
  version: () => ipcRenderer.invoke('app-version'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateReady: (cb) => ipcRenderer.on('update-ready', (_e, v) => cb(v))
});
