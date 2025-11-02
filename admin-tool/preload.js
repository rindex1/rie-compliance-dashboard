const { contextBridge, shell } = require('electron');

contextBridge.exposeInMainWorld('env', {
  platform: process.platform
});

contextBridge.exposeInMainWorld('electron', {
  shell: {
    openExternal: (url) => shell.openExternal(url)
  }
});


