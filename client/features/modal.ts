class Modal {
  dialog: HTMLDialogElement;

  constructor() {
    this.dialog = document.querySelector('dialog') as HTMLDialogElement;
    this.dialog.addEventListener('close', (): void => {
      this.dialog.innerHTML = '';
    });
    this.dialog.addEventListener('click', (e: MouseEvent): void => {
      const dialogDimensions: DOMRect = this.dialog.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        this.dialog.close();
      }
    });
  }

  isModalOpen(): boolean {
    return this.dialog.open;
  }

  showModal(modal: HTMLElement): void {
    this.dialog.innerText = '';
    this.dialog.appendChild(modal);
    this.dialog.showModal();
  }

  hideModal(): void {
    this.dialog.innerText = '';
    this.dialog.close();
  }
}

export default new Modal();
