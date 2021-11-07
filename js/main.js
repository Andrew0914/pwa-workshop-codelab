/*
 Copyright 2021 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import swURL from 'sw:../service-worker.js';

// Register service worker, the if below is to check inf browsers supports serviceworker
if ('serviceWorker' in navigator) {
  // Wait for the load event to not block other work (until site has been loaded)
  window.addEventListener('load', async () => {
    try {
      // Try to register service worker
      const registry = await navigator.serviceWorker.register(swURL);
      console.log('Service worker registered 🍕', registry);
    } catch (error) {
      console.error('😿 Service worker registration failed', error);
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  // Set up the editor
  const { Editor } = await import('./app/editor.js');
  const editor = new Editor(document.body);

  // Set up the menu
  const { Menu } = await import('./app/menu.js');
  new Menu(document.querySelector('.actions'), editor);

  // Set the initial state in the editor
  const defaultText = `# Welcome to PWA Edit!\n\nTo leave the editing area, press the \`esc\` key, then \`tab\` or \`shift+tab\`.`;

  editor.setContent(defaultText);
});
