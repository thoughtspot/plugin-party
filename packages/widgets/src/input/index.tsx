import { FunctionComponent, RefObject } from 'preact';
import { forwardRef } from 'preact/compat';
import cx from 'classnames';
import { JSXInternal } from 'preact/src/jsx';
import styles from './input.module.scss';

export interface InputProps
  extends JSXInternal.HTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  className?: string;
  id?: string;
  onChange?: any;
  type?: 'TEXT' | 'PASSWORD';
  initialValue?: string;
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      placeholder,
      className,
      id,
      type,
      initialValue,
      onChange,
      hasError = false,
      ...rest
    }: InputProps,
    ref
  ) => {
    const classes = cx(styles.input, className, { [styles.error]: hasError });
    return (
      <input
        value={initialValue}
        ref={ref}
        id={id}
        placeholder={placeholder}
        className={classes}
        type={type}
        onChange={onChange}
        {...rest}
      />
    );
  }
);
