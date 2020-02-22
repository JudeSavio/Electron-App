const { app , BrowserWindow , ipcMain } = require('electron')
//const windowStateKeeper = require('electron-window-state')
const readItem = require('./readItem')

let mainWindow

ipcMain.on('new-item', (e,itemurl) => {
    readItem( itemurl, item => {
        e.sender.send('new-item-success',item)
    })
})

function createWindow()
{
    
    mainWindow = new BrowserWindow({
        x: 100, y: 100,
        width: 500 , height: 500,
        minWidth:350,maxWidth:650,
        minHeight:450,maxHeight:800,
        webPreferences : { nodeIntegration : true }
    })

    mainWindow.loadFile('Renderer/main.html')

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready',createWindow)

app.on('window-all-closed',()=>{
    if(process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    if(mainWindow === null ) createWindow()
})