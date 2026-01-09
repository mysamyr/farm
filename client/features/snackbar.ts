import { Div } from '../components';

class Snackbar {
  timer: number | undefined;
  component: HTMLElement | null = null;
  messages: string[] = [];
  TIME_TO_HIDE: number = 3 * 1000;

  _startTimer(): void {
    this.timer = setTimeout(() => this._closeHandler(), this.TIME_TO_HIDE);
  }

  _clearTimer(): void {
    clearTimeout(this.timer);
    delete this.timer;
  }

  _showMessage(msg: string): void {
    const component = Div({
      className: 'snackbar-container',
    });
    component.append(
      Div({
        className: 'snackbar-label',
        text: msg,
      }),
      Div({
        className: 'snackbar-dismiss',
        text: '×',
        onClick: () => this._closeHandler(),
      })
    );

    component.addEventListener('mouseleave', () => this._startTimer());
    component.addEventListener('mouseenter', () => this._clearTimer());
    component.addEventListener('touchend', () => this._startTimer());
    component.addEventListener('touchstart', () => this._clearTimer());

    this._startTimer();
    document.body.appendChild(component);
    this.component = component;
  }

  _closeHandler(): void {
    this.messages.shift();
    if (this.component) this.component.remove();
    this.component = null;
    this._clearTimer();

    if (this.messages.length) {
      this._showMessage(this.messages[0] as string);
    }
  }

  displayMsg(msg: string): void {
    this.messages.push(msg);
    if (!this.component) {
      this._showMessage(msg);
    }
  }
}

export default new Snackbar();
