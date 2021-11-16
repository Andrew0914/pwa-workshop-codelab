import { openDB } from 'idb';

const FILE_HANDLER_KEY = 'fileHandler';
const FILE_HANDLER_OPTIONS = {
  types: [
    {
      description: 'Markdown Files',
      accept: {
        'text/markdown': ['.md', '.markdown'],
      },
    },
  ],
};

export class Actions {
  constructor() {
    this.handler;
    this.db;

    openDB('settings-store').then(async (db) => {
      this.db = db;
      const filerHandler = await this.db.get('settings', FILE_HANDLER_KEY);
      if (filerHandler) {
        this.handler = filerHandler;
        document.querySelector('title').innerText = `${this.handler.name}|PWA Edit`;
      }
    });

    if ('launchQueue' in window) {
      launchQueue.setCustomer(params => {
        if (params.files.len <= 0) return;
        for (const handler of params.files)
          this.open(handler);
      });
    }

    window.addEventListener('beforeunload', () => {
      if (this.previewWindow)
        this.previewWindow.close();
    });
  }

  /**
   * Function to call when the open button is triggered
   */
  async open(launchHandler) {
    try {
      let handler;
      if (launchHandler instanceof FileSystemFileHandle) {
        handler = launchHandler;
      } else {
        [handler] = await window.showOpenFilePicker(FILE_HANDLER_OPTIONS);
      }
      await this.db.put('settings', handler, FILE_HANDLER_KEY);
      document.querySelector('title').innerText = `${handler.name} | PWA Edit`;
      const file = await handler.getFile();
      const content = await file.text();
      this.editor.setContent(content);
      this.handler = handler;
    } catch (error) {
      console.error('Error ❌, ', error);
    }
  }

  /**
   * Function to call when the save button is triggered
   */
  async save() {
    const handler = this.handler || (await this.db.get('settings', 'handler'));

    if (!handler) {
      await this.saveAs();
    } else {
      try {
        const writable = await handler.createWritable();
        await writable.write(this.editor.content());
        await writable.close();
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Function to call when the duplicate/save as button is triggered
   */
  async saveAs() {
    try {
      const handler = await window.showSaveFilePicker(FILE_HANDLER_OPTIONS);

      this.handler = handler;
      await this.db.put('settings', handler, 'handler');
      await this.save();
    } catch (error) {
      console.error('Error ❌, ', error);
    }
  }

  /**
   * Reset the editor and file handler
   */
  async reset() {
    document.querySelector('title').innerText = 'PWA Edit';
    await this.db.delete('settings', FILE_HANDLER_KEY);
    this.editor.setContent('');
    this.handler = null;
  }

  /**
   * Function to call when the preview button is triggered
   */
  async preview() {
    if ('getScreens' in window) {
      if (this.previewWindow) {
        this.previewWindow.close();
        this.previewWindow = null;
        return;
      }
      const options = 'menubar=0,toolbar=0,status=0,location=0';
      const { screens } = await window.getScreens();
      // Find the primary screen
      const screen = screens.find((s) => s.isPrimary);
      // Get it's available width
      const width = screen.availWidth / 2;
      // Build a window from the information
      this.previewWindow = window.open('/preview', 'Markdown preview', `${options},left=${width},top=${screen.availTop},height=${screen.availHeight},width=${width}`);
    } else {
      console.warn('Oops!, It looks that this functionality is not available for you');
    }
  }


  /**
   * Function to call when the focus button is triggered
   */
  async focus() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      if (this.wakeLock) {
        this.wakeLock.release();
        this.wakeLock = null;
      }
    } else {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request();
      }
      await document.body.requestFullscreen();
    }
  }

}