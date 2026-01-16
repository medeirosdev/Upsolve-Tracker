const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize electron-store for persistent data
const store = new Store({
    name: 'upsolve-data',
    defaults: {
        problems: [],
        notes: [],
        snippets: [],
        goals: { daily: 3, weekly: 15 },
        badges: { unlocked: [], custom: [], totalXP: 0, level: 1 },
    },
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
    app.quit();
}

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        title: 'UpSolve',
        icon: path.join(__dirname, 'public/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        show: false,
        backgroundColor: '#1a1a2e',
    });

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // DevTools: Ctrl+Shift+I to open manually
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Remove menu in production
    if (!isDev) {
        mainWindow.setMenu(null);
    }
}

// IPC Handlers for electron-store
ipcMain.handle('store:get', (_, key) => {
    return store.get(key);
});

ipcMain.handle('store:set', (_, key, value) => {
    store.set(key, value);
    return true;
});

ipcMain.handle('store:delete', (_, key) => {
    store.delete(key);
    return true;
});

ipcMain.handle('store:clear', () => {
    store.clear();
    return true;
});

ipcMain.handle('store:getAll', () => {
    return store.store;
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
