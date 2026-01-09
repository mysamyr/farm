import { Div, Input, Label, Span } from '.';

export default function (params: {
  inputClassName?: string | string[];
  label: string;
  checked?: boolean;
  onChange: (e: Event) => void;
}): HTMLDivElement {
  return Div({
    className: 'toggle',
    children: [
      Label({
        className: 'switch',
        children: [
          Input({
            className: params.inputClassName,
            type: 'checkbox',
            checked: !!params.checked,
            onChange: params.onChange,
          }),
          Span({ className: ['slider', 'round'] }),
        ],
      }),
      Span({ text: params.label }),
    ],
  });
}
