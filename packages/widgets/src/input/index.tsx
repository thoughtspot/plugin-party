import { FunctionComponent, RefObject } from 'preact';
import { forwardRef } from 'preact/compat';
import './input.scss';
import cx from 'classnames';
import { JSXInternal } from 'preact/src/jsx';

export interface InputProps
  extends JSXInternal.HTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  className?: string;
  id?: string;
  type?: 'TEXT' | 'PASSWORD';
  initialValue?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { placeholder, className, id, type, initialValue, ...rest }: InputProps,
    ref
  ) => {
    const classes = cx('input', className);
    return (
      <input
        value={initialValue}
        ref={ref}
        id={id}
        placeholder={placeholder}
        className={classes}
        type={type}
        {...rest}
      />
    );
  }
);
