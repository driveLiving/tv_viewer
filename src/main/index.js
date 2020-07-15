import { app,screen,Menu, BrowserWindow, ipcMain } from "electron"

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\")
}

let myWindow = null

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (myWindow) {
    if (myWindow.isMinimized()) myWindow.restore()
    myWindow.focus()
  }
})

if (isSecondInstance) {
  app.quit()
}




let mainWindow
const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  let size = screen.getPrimaryDisplay().workAreaSize
  let sWidth=size.width;
  let sHeight=size.height;
  mainWindow = new BrowserWindow({
    height: sHeight,
    width: sWidth,
    frame: true,
    webPreferences: {
      webSecurity: false
    }
  })
  Menu.setApplicationMenu(null);

  mainWindow.loadURL(winURL)
  mainWindow.webContents.closeDevTools()
  mainWindow.on("closed", () => {
    mainWindow = null
  })
  ipcMain.on("close", e => {
    mainWindow.close()
    mainWindow = null
    app.quit()
  })
  ipcMain.on("hide-window", e => {
    mainWindow.minimize()
  })
  ipcMain.on("max-window", e => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore()
    } else {
      mainWindow.maximize()
    }
  })
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
