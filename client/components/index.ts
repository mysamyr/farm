import { isNil } from '../utils/helpers';

import {
  applyAttrs,
  applyChildren,
  applyFocus,
  applyIdClass,
  applyOnChange,
  applyOnClick,
  applyOnEnter,
  applyOnSubmit,
  applyText,
} from './helpers';

import type { AriaAttrs, ClassValue, DataAttrs } from './types';

export { default as Slider } from './Slider';

export const Div = (props?: {
  className?: ClassValue;
  text?: string;
  id?: string;
  title?: string;
  onClick?: (this: HTMLDivElement, ev: MouseEvent) => void;
  children?: HTMLElement[];
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLDivElement => {
  const div = document.createElement('div');
  if (!props) return div;
  applyIdClass(div, props);
  applyText(div, props.text);
  applyOnClick<HTMLDivElement>(div, props.onClick);
  applyAttrs(div, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(div, props.children);
  if (props.title) div.title = props.title;
  return div;
};

export const Form = (props?: {
  className?: ClassValue;
  text?: string;
  id?: string;
  onSubmit?: (this: HTMLFormElement, ev: SubmitEvent) => void;
  children?: HTMLElement[];
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLFormElement => {
  const form = document.createElement('form');
  if (!props) return form;
  applyIdClass(form, props);
  applyText(form, props.text);
  applyOnSubmit(form, props.onSubmit);
  applyAttrs(form, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(form, props.children);
  return form;
};

export const Header = (
  lvl: number,
  props: {
    className?: ClassValue;
    text?: string;
    id?: string;
    onClick?: (this: HTMLHeadingElement, ev: MouseEvent) => void;
    children?: HTMLElement[];
    data?: DataAttrs;
    aria?: AriaAttrs;
    role?: string;
    tabIndex?: number;
  }
): HTMLHeadingElement => {
  const h = document.createElement(`h${lvl}`) as HTMLHeadingElement;
  applyIdClass(h, props);
  applyText(h, props.text);
  applyOnClick<HTMLHeadingElement>(h, props.onClick);
  applyAttrs(h, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(h, props.children);
  return h;
};

export const Paragraph = (props?: {
  className?: ClassValue;
  text?: string;
  id?: string;
  onClick?: (this: HTMLParagraphElement, ev: MouseEvent) => void;
  children?: HTMLElement[];
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLParagraphElement => {
  const p = document.createElement('p');
  if (!props) return p;
  applyIdClass(p, props);
  applyText(p, props.text);
  applyOnClick<HTMLParagraphElement>(p, props.onClick);
  applyAttrs(p, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(p, props.children);
  return p;
};

export const Span = (props?: {
  className?: ClassValue;
  text?: string;
  id?: string;
  onClick?: (this: HTMLSpanElement, ev: MouseEvent) => void;
  children?: HTMLElement[];
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLSpanElement => {
  const span = document.createElement('span');
  if (!props) return span;
  applyIdClass(span, props);
  applyText(span, props.text);
  applyOnClick<HTMLSpanElement>(span, props.onClick);
  applyAttrs(span, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(span, props.children);
  return span;
};

export const Input = (props?: {
  className?: ClassValue;
  id?: string;
  type?: string;
  name?: string;
  value?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  autocomplete?: AutoFill;
  step?: string;
  checked?: boolean;
  required?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onEnter?: (ev: KeyboardEvent) => void;
  onClick?: (this: HTMLInputElement, ev: MouseEvent) => void;
  onChange?: (this: HTMLInputElement, ev: Event) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLInputElement => {
  const input = document.createElement('input');
  if (!props) return input;
  applyIdClass(input, props);
  applyFocus(input, props.focus);
  applyOnEnter<HTMLInputElement>(input, props.onEnter);
  applyOnClick<HTMLInputElement>(input, props.onClick);
  applyOnChange<HTMLInputElement>(input, props.onChange);
  applyAttrs(input, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  input.type = props?.type || 'text';
  if (props.name) input.name = props.name;
  if (!isNil(props.value)) input.value = String(props.value);
  if (!isNil(props.min)) {
    if (input.type === 'number') input.min = `${props.min}`;
    else input.minLength = props.min;
  }
  if (!isNil(props.max)) {
    if (input.type === 'number') input.max = `${props.max}`;
    else input.maxLength = props.max;
  }
  if (props.placeholder) input.placeholder = props.placeholder;
  if (props.autocomplete) input.autocomplete = props.autocomplete;
  if (props.step) input.step = props.step;
  input.checked = !!props.checked;
  input.required = !!props.required;
  input.disabled = !!props.disabled;
  return input;
};

export const Label = (props?: {
  className?: ClassValue;
  text?: string;
  id?: string;
  htmlFor?: string;
  children?: HTMLElement[];
  onClick?: (this: HTMLLabelElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLLabelElement => {
  const label = document.createElement('label');
  if (!props) return label;
  applyIdClass(label, props);
  if (props.htmlFor) label.htmlFor = props.htmlFor;
  applyText(label, props.text);
  applyOnClick<HTMLLabelElement>(label, props.onClick);
  applyAttrs(label, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(label, props.children);
  return label;
};

export const Option = (props?: {
  id?: string;
  className?: ClassValue;
  text?: string;
  value?: string;
  selected?: boolean;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLOptionElement => {
  const option = document.createElement('option');
  if (!props) return option;
  applyIdClass(option, props);
  applyText(option, props.text);
  applyAttrs(option, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  if (props.value) option.value = props.value;
  option.selected = !!props.selected;
  return option;
};

export const Select = (props?: {
  className?: ClassValue;
  id?: string;
  name?: string;
  value?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (this: HTMLSelectElement, ev: Event) => void;
  children?: HTMLElement[];
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLSelectElement => {
  const select = document.createElement('select');
  if (!props) return select;
  applyIdClass(select, props);
  applyOnChange<HTMLSelectElement>(select, props.onChange);
  applyAttrs(select, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(select, props.children);
  if (props.name) select.name = props.name;
  if (!isNil(props.value)) select.value = String(props.value);
  select.multiple = !!props.multiple;
  select.required = !!props.required;
  select.disabled = !!props.disabled;
  return select;
};

export const Pre = (props?: {
  className?: ClassValue;
  text?: string;
  id?: string;
  children?: HTMLElement[];
  onClick?: (this: HTMLPreElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLPreElement => {
  const pre = document.createElement('pre');
  if (!props) return pre;
  applyIdClass(pre, props);
  applyText(pre, props.text);
  applyOnClick<HTMLPreElement>(pre, props.onClick);
  applyAttrs(pre, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(pre, props.children);
  return pre;
};

export const ListItem = (props?: {
  className?: ClassValue;
  id?: string;
  text?: string;
  onClick?: (this: HTMLLIElement, ev: MouseEvent) => void;
  children?: HTMLElement[];
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLLIElement => {
  const li = document.createElement('li');
  if (!props) return li;
  applyIdClass(li, props);
  applyText(li, props.text);
  applyOnClick<HTMLLIElement>(li, props.onClick);
  applyAttrs(li, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(li, props.children);
  return li;
};

export const UList = (props?: {
  className?: ClassValue;
  id?: string;
  children?: HTMLElement[];
  onClick?: (this: HTMLUListElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLUListElement => {
  const ul = document.createElement('ul');
  if (!props) return ul;
  applyIdClass(ul, props);
  applyOnClick<HTMLUListElement>(ul, props.onClick);
  applyAttrs(ul, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(ul, props.children);
  return ul;
};

export const OList = (props?: {
  className?: ClassValue;
  id?: string;
  children?: HTMLElement[];
  onClick?: (this: HTMLOListElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLOListElement => {
  const ol = document.createElement('ol');
  if (!props) return ol;
  applyIdClass(ol, props);
  applyOnClick<HTMLOListElement>(ol, props.onClick);
  applyAttrs(ol, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(ol, props.children);
  return ol;
};

export const Textarea = (props?: {
  className?: ClassValue;
  id?: string;
  name?: string;
  value?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (this: HTMLTextAreaElement, ev: MouseEvent) => void;
  onChange?: (this: HTMLTextAreaElement, ev: Event) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLTextAreaElement => {
  const textarea = document.createElement('textarea');
  if (!props) return textarea;
  applyIdClass(textarea, props);
  applyFocus(textarea, props.focus);
  applyOnClick<HTMLTextAreaElement>(textarea, props.onClick);
  applyOnChange<HTMLTextAreaElement>(textarea, props.onChange);
  applyAttrs(textarea, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  if (props.name) textarea.name = props.name;
  if (!isNil(props.value)) textarea.value = String(props.value);
  if (props.min) textarea.maxLength = props.min;
  if (props.max) textarea.maxLength = props.max;
  if (props.placeholder) textarea.placeholder = props.placeholder;
  textarea.required = !!props.required;
  textarea.disabled = !!props.disabled;
  return textarea;
};

export const Link = (props?: {
  id?: string;
  text?: string;
  href?: string;
  target?: string;
  title?: string;
  download?: string;
  rel?: string;
  className?: ClassValue;
  onClick?: (this: HTMLAnchorElement, ev: MouseEvent) => void;
  children?: HTMLElement[];
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLAnchorElement => {
  const a = document.createElement('a');
  if (!props) return a;
  applyIdClass(a, props);
  applyText(a, props.text);
  applyOnClick<HTMLAnchorElement>(a, props.onClick);
  applyAttrs(a, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(a, props.children);
  if (props.href) a.href = props.href;
  if (props.target) a.target = props.target;
  if (props.title) a.title = props.title;
  if (props.download) a.download = props.download;
  if (props.rel) a.rel = props.rel;
  return a;
};

export const Image = (props?: {
  id?: string;
  src?: string;
  alt?: string;
  title?: string;
  width?: number;
  className?: ClassValue;
  onClick?: (this: HTMLImageElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLImageElement => {
  const img = document.createElement('img');
  if (!props) return img;
  applyIdClass(img, props);
  applyOnClick<HTMLImageElement>(img, props.onClick);
  applyAttrs(img, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  if (props.src) img.src = props.src;
  if (props.alt) img.alt = props.alt;
  if (props.width) img.width = props.width;
  if (props.title) img.title = props.title;
  return img;
};

export const TableHeader = (props?: {
  id?: string;
  className?: ClassValue;
  children?: HTMLElement[];
  onClick?: (this: HTMLTableSectionElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLTableSectionElement => {
  const thead = document.createElement('thead');
  if (!props) return thead;
  applyIdClass(thead, props);
  applyOnClick<HTMLTableSectionElement>(thead, props.onClick);
  applyAttrs(thead, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(thead, props.children);
  return thead;
};

export const TableBody = (props?: {
  id?: string;
  className?: ClassValue;
  children?: HTMLElement[];
  onClick?: (this: HTMLTableSectionElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLTableSectionElement => {
  const tbody = document.createElement('tbody');
  if (!props) return tbody;
  applyIdClass(tbody, props);
  applyOnClick<HTMLTableSectionElement>(tbody, props.onClick);
  applyAttrs(tbody, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(tbody, props.children);
  return tbody;
};

export const TableHeaderCell = (props?: {
  id?: string;
  className?: ClassValue;
  text?: string;
  children?: HTMLElement[];
  onClick?: (this: HTMLTableCellElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLTableCellElement => {
  const th = document.createElement('th');
  if (!props) return th;
  applyIdClass(th, props);
  applyText(th, props.text);
  applyOnClick<HTMLTableCellElement>(th, props.onClick);
  applyAttrs(th, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(th, props.children);
  return th;
};

export const TableRow = (props?: {
  id?: string;
  className?: ClassValue;
  children?: HTMLElement[];
  onClick?: (this: HTMLTableRowElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLTableRowElement => {
  const tr = document.createElement('tr');
  if (!props) return tr;
  applyIdClass(tr, props);
  applyOnClick<HTMLTableRowElement>(tr, props.onClick);
  applyAttrs(tr, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(tr, props.children);
  return tr;
};

export const TableData = (props?: {
  id?: string;
  className?: ClassValue;
  text?: string;
  children?: HTMLElement[];
  onClick?: (this: HTMLTableCellElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLTableCellElement => {
  const td = document.createElement('td');
  if (!props) return td;
  applyIdClass(td, props);
  applyText(td, props.text);
  applyOnClick<HTMLTableCellElement>(td, props.onClick);
  applyAttrs(td, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(td, props.children);
  return td;
};

export const Button = (props?: {
  className?: ClassValue;
  id?: string;
  text?: string;
  title?: string;
  children?: HTMLElement[];
  disabled?: boolean;
  onClick?: (this: HTMLButtonElement, ev: MouseEvent) => void;
  data?: DataAttrs;
  aria?: AriaAttrs;
  role?: string;
  tabIndex?: number;
}): HTMLButtonElement => {
  const btn = document.createElement('button');
  if (!props) return btn;
  applyIdClass(btn, props);
  applyText(btn, props.text);
  if (props.title) btn.title = props.title;
  btn.disabled = !!props.disabled;
  applyOnClick<HTMLButtonElement>(btn, props.onClick);
  applyAttrs(btn, {
    data: props.data,
    aria: props.aria,
    role: props.role,
    tabIndex: props.tabIndex,
  });
  applyChildren(btn, props.children);
  return btn;
};
