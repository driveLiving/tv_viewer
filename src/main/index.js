import { app,screen,Menu, BrowserWindow, ipcMain,MenuItem } from "electron"
const ipcRenderer = require('electron').ipcRenderer;
const {dialog} = require('electron');
const clipboard = require('electron').clipboard;

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\")
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
  let sWidth=size.width;
  let sHeight=size.height;
  mainWindow = new BrowserWindow({
    height: sHeight,
    width: sWidth,
    frame: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true, // 是否集成 Nodejs,把之前预加载的js去了，发现也可以运行
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
              title : "源文件",
              buttonLabel : "打开",
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
          label: '输入源文本',
          click: () =>{
            mainWindow.webContents.send("inputText",{});
          }
        },
        {
          label: '输入m3u8链接',
          click: () =>{
            mainWindow.webContents.send("inputM3U8",{});
          }
        }
      ]
    }
  ];

  var menu = Menu.buildFromTemplate(application_menu);
  Menu.setApplicationMenu(menu);

  mainWindow.loadURL(winURL)
  // mainWindow.webContents.closeDevTools()
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
ipcMain.on("fullEvent",(event,message) => {
  console.log(message);
  mainWindow.setMenuBarVisibility(!message);
});
ipcMain.on("clickRightEvent",(event,message) => {
  console.log(message);
  const menu = new Menu();
  menu.append(new MenuItem({ label: '复制播放链接', click: () => {
      clipboard.writeText(message.uu)
      }
    })
  );
  const win = BrowserWindow.fromWebContents(event.sender);
  menu.popup(win);
});
