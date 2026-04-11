import { Div } from '../components';

import { getLanguageConfig } from './language';

class WinningAnimation {
  timer: ReturnType<typeof setTimeout> | undefined;
  ANIMATION_DURATION: number = 3 * 1000;

  private _createConfetti(): HTMLElement {
    const confetti = Div({
      className: 'confetti',
    });
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    return confetti;
  }

  private _createWinnerOverlay(): HTMLElement {
    const container = Div({
      className: 'winner-animation-container',
    });

    const title = Div({
      className: 'winner-title',
      text: `🎉 ${getLanguageConfig().youWon} 🎉`,
    });

    const confettiContainer = Div({
      className: 'confetti-container',
    });

    // Create multiple confetti pieces
    for (let i = 0; i < 50; i++) {
      confettiContainer.appendChild(this._createConfetti());
    }

    container.appendChild(title);
    container.appendChild(confettiContainer);

    return container;
  }

  private _closeAnimation(element: HTMLElement): void {
    element.classList.add('fade-out');
    this.timer = setTimeout(() => {
      element.remove();
    }, 500);
  }

  play(): void {
    const overlay = this._createWinnerOverlay();
    document.body.appendChild(overlay);

    // Auto-close after animation duration
    this.timer = setTimeout(() => {
      this._closeAnimation(overlay);
    }, this.ANIMATION_DURATION);

    // Allow manual close on click
    overlay.addEventListener('click', () => {
      clearTimeout(this.timer);
      this._closeAnimation(overlay);
    });
  }
}

export default new WinningAnimation();
