// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const wallpaper = require('wallpaper');
const os = require('os');
const fs = require('fs');
const http = require('http');
const Stream = require('stream').Transform;


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,  
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')


  var downloaded_images_path = "./downloaded_images/"; 
  var filename = Date.now()+'.jpg'
  var pic_path = downloaded_images_path+filename
  

    // main process
    mainWindow.webContents.send('store-data', [123]);


  if (!fs.existsSync(downloaded_images_path)){
      fs.mkdirSync(downloaded_images_path);
  }

  http.request("http://hubbleharvest.ch:8080", function(response) {                                        
    var data = new Stream();                                                    
  
    response.on('data', function(chunk) {                                       
      data.push(chunk);                                                         
    });                                                                         
  
    response.on('end', function() { 

      fs.writeFileSync(pic_path, data.read());    
      
      //'auto' | 'fill' | 'fit' | 'stretch' | 'center'
      wallpaper.set(pic_path, {scale: "center"})
      .then(() => {
        console.log(path.resolve(pic_path));
        //this.$snackbar.open("Done !");
      });




    });                                                                         
  }).end();

  

    //let picturePath = path.join(", "os.homedir(), "/PicturesHaeckel_Blastoidea.jpg");
    //picturePath = path.normalize(picturePath);
    //fs.writeFile(picturePath, base64Image, 'base64', (err) => {
    //});
  

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

