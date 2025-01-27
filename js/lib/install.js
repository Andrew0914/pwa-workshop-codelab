export class Install {
  /**
   * @param {DOMElement} trigger - Triggering element
   */
  constructor(trigger) {
    this._prompt;
    this._trigger = trigger;

    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this._prompt = e;
      this.toggleInstallButton('show');
    });

    // Trigger install prompt
    this._trigger.addEventListener('click', async () => {
      await this.install();
    });

    // Hide install prompt on install
    window.addEventListener('appinstalled', () => {
      this._prompt = null;
      this.toggleInstallButton('hide');
    });
  }

  /**
   * Toggle visibility of install button
   * @param {string} action
   */
  toggleInstallButton(action = 'hide') {
    if (action === 'hide') {
      this._trigger.style.display = 'none';
    } else {
      this._trigger.style.display = 'block';
    }
  }

  async install() {
    if (!this._prompt) return;
    this._prompt.prompt();
    const { outcome } = await this._prompt.userChoice;

    this._prompt = null;

    if (outcome === 'accepted') {
      this.toggleInstallButton('hide');
    }
  }
}