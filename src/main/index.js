import { app,screen,Menu, BrowserWindow, ipcMain } from "electron"
const ipcRenderer = require('electron').ipcRenderer;
const {dialog} = require('electron');

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



let mainWindow;



const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  let size = screen.getPrimaryDisplay().workAreaSize
  let sWidth=1215
  let sHeight=533;
  mainWindow = new BrowserWindow({
    height: sHeight,
    width: sWidth,
    frame: true,
    webPreferences: {
      webSecurity: false
    }
  });

  let application_menu = [
    {
      label: '直播源',
      submenu:[
        {
          label: '在线地址',
          click: () =>{
            mainWindow.webContents.send("toInputUrl",{});
          }
        },
        {
          label: '本地文件',
          click: () =>{
            let options = {
              // See place holder 1 in above image
              title : "源文件",
              // See place holder 3 in above image
              buttonLabel : "打开",
              // See place holder 4 in above image
              filters :[
                {name: '源文件', extensions: ['txt']}
              ],
              properties: ['openFile']
            };
            let filePath = dialog.showOpenDialog(mainWindow, options)
            mainWindow.webContents.send("selectedFile",{path:filePath});


          }
        },
        {
          label: '直接输入',
          click: () =>{
            mainWindow.webContents.send("inputText",{});
          }
        }
      ]
    }
  ];

  var menu = Menu.buildFromTemplate(application_menu);
  Menu.setApplicationMenu(menu);

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
