const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Hanya satu jendela aplikasi
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1300,
    height: 850,
    title: 'WA Hub',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  });
  win.loadFile('index.html');
}

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

// Pengaturan untuk setiap tampilan WhatsApp Web
app.on('web-contents-created', (_e, contents) => {
  if (contents.getType() !== 'webview') return;

  const allowed = [
    'notifications',
    'media',
    'clipboard-read',
    'clipboard-sanitized-write',
    'fullscreen'
  ];
  contents.session.setPermissionRequestHandler((_wc, permission, cb) => {
    cb(allowed.includes(permission));
  });

  // Link keluar dibuka di browser bawaan, bukan di dalam aplikasi
  contents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
});

// Hapus sesi (logout total) saat akun dihapus
ipcMain.handle('clear-session', async (_e, partition) => {
  if (typeof partition !== 'string' || !partition.startsWith('persist:wa-')) return false;
  const s = session.fromPartition(partition);
  await s.clearStorageData();
  await s.clearCache();
  return true;
});

// Saran jawaban AI: hanya membuat draf teks, tidak mengirim apa pun ke WhatsApp
ipcMain.handle('ai-suggest', async (_e, { apiKey, context }) => {
  if (!apiKey || typeof apiKey !== 'string') return { error: 'API key belum diisi.' };
  if (!context || typeof context !== 'string') return { error: 'Chat terakhir tidak terbaca.' };
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5-5',
        max_tokens: 400,
        system:
          'Kamu membantu admin menulis draf balasan WhatsApp dalam Bahasa Indonesia yang sopan, singkat, dan natural. ' +
          'Jangan mengarang harga, stok, atau janji yang tidak ada di percakapan; jika info belum ada, tulis [isi di sini]. ' +
          'Keluarkan hanya teks balasan, tanpa penjelasan.',
        messages: [
          { role: 'user', content: 'Pesan terakhir dari pelanggan:\n\n' + context.slice(0, 4000) + '\n\nBuatkan satu draf balasan.' }
        ]
      })
    });
    const data = await res.json();
    if (!res.ok) return { error: (data && data.error && data.error.message) || 'Permintaan gagal (' + res.status + ').' };
    const text = (data.content || []).map((c) => c.text || '').join('').trim();
    return { text };
  } catch (err) {
    return { error: 'Tidak bisa terhubung: ' + err.message };
  }
});

// ---- Update otomatis (Windows). Mac butuh aplikasi bertanda tangan, jadi install manual. ----
function setupUpdater() {
  if (!app.isPackaged || process.platform !== 'win32') return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-downloaded', (info) => {
    if (win && !win.isDestroyed()) win.webContents.send('update-ready', info.version);
  });
  autoUpdater.on('error', () => {});
  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 8000);
  setInterval(check, 6 * 60 * 60 * 1000);
}

ipcMain.handle('app-version', () => {
  try { return require('./package.json').displayVersion || app.getVersion(); } catch (e) { return app.getVersion(); }
});
ipcMain.handle('install-update', () => { autoUpdater.quitAndInstall(); });

app.whenReady().then(() => {
  createWindow();
  setupUpdater();
});

app.on('window-all-closed', () => {
  app.quit();
});
