const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hub', {
  clearSession: (partition) => ipcRenderer.invoke('clear-session', partition),
  suggest: (apiKey, context) => ipcRenderer.invoke('ai-suggest', { apiKey, context })
});
