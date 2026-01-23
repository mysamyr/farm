import { isNil } from '../utils/helpers';

import type { AriaAttrs, ClassValue, DataAttrs } from './types';

const applyClassNames = (el: Element, className?: ClassValue): void => {
  if (!className) return;
  const list = Array.isArray(className)
    ? className
    : className.split(' ').filter(Boolean);
  if (list.length) el.classList.add(...list);
};
export const applyIdClass = (
  el: Element,
  props: { className?: ClassValue; id?: string }
): void => {
  applyClassNames(el, props.className);
  if (props.id) el.id = props.id;
};

export const applyText = (el: HTMLElement, text?: string): void => {
  if (!isNil(text)) el.textContent = String(text);
};

export const applyAttrs = (
  el: HTMLElement,
  opts?: {
    data?: DataAttrs;
    aria?: AriaAttrs;
    role?: string;
    tabIndex?: number;
  }
): void => {
  if (!opts) return;
  const { data, aria, role, tabIndex } = opts;
  if (role) el.setAttribute('role', role);
  if (!isNil(tabIndex)) el.tabIndex = Number(tabIndex);
  if (data) {
    for (const [key, val] of Object.entries(data)) {
      if (isNil(val)) continue;
      el.setAttribute(`data-${key}`, String(val));
    }
  }
  if (aria) {
    for (const [key, val] of Object.entries(aria)) {
      if (isNil(val)) continue;
      el.setAttribute(`aria-${key}`, String(val));
    }
  }
};

const applyOn = <T extends HTMLElement, K extends keyof HTMLElementEventMap>(
  el: T,
  type: K,
  handler?: (this: T, ev: HTMLElementEventMap[K]) => void
): void => {
  if (handler) el.addEventListener(type, handler as EventListener);
};

export const applyOnClick = <T extends HTMLElement>(
  el: T,
  onClick?: (this: T, ev: MouseEvent) => void
): void => applyOn(el, 'click', onClick);

export const applyOnEnter = <T extends HTMLElement>(
  el: T,
  onEnter?: (ev: KeyboardEvent) => void
): void => {
  if (!onEnter) return;
  el.addEventListener('keydown', e => {
    if ((e as KeyboardEvent).key === 'Enter') onEnter(e as KeyboardEvent);
  });
};

export const applyOnChange = <T extends HTMLElement>(
  el: T,
  onChange?: (ev: Event) => void
): void => applyOn(el, 'change', onChange);

export const applyOnSubmit = (
  el: HTMLFormElement,
  onSubmit?: (ev: SubmitEvent) => void
): void => {
  if (onSubmit) el.addEventListener('submit', onSubmit);
};

export const applyFocus = (el: HTMLElement, focus?: boolean): void => {
  if (focus) setTimeout(() => el.focus(), 0);
};

export const applyChildren = (
  el: HTMLElement,
  children?: Array<HTMLElement | null>
): void => {
  if (children && children.length)
    el.append(...(children.filter(Boolean) as HTMLElement[]));
};
