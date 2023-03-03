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
  type?: 'TEXT' | 'PASSWORD';
  initialValue?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { placeholder, className, id, type, initialValue, ...rest }: InputProps,
    ref
  ) => {
    const classes = cx(styles.input, className);
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
