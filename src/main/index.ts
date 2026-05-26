import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initDatabase } from './db/database'
import { setupPatientsHandlers } from './modules/patients'
import { setupAppointmentsHandlers } from './modules/appointments'
import { setupClinicalHandlers } from './modules/clinical'
import { setupBillingHandlers } from './modules/billing'
import { setupAuthHandlers } from './modules/auth'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    title: 'LIADENT CRM - Gestión Odontológica Profesional',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  try {
    electronApp.setAppUserModelId('com.liadent.crm')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // Initialize Database
    initDatabase()

    // Setup IPC Handlers
    setupAuthHandlers()
    setupPatientsHandlers()
    setupAppointmentsHandlers()
    setupClinicalHandlers()
    setupBillingHandlers()

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  } catch (error) {
    console.error('Error during app initialization:', error)
    dialog.showErrorBox('Error de Inicialización', `No se pudo iniciar la aplicación: ${error}`)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
