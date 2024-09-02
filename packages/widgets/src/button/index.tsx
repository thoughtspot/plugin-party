import cx from 'classnames';
import styles from './button.module.scss';

export interface ButtonProps {
  type?: 'PRIMARY' | 'SECONDARY' | 'ICON';
  className?: string;
  children?: any;
  text?: string;
  onClick: (e) => void;
  id?: string;
  isDisabled?: boolean;
  disabledReason?: string;
}

export const Button = ({
  type = 'PRIMARY',
  className,
  children,
  text,
  onClick,
  id,
  isDisabled,
  disabledReason,
}: ButtonProps) => {
  const classnames = cx(
    className,
    styles.btn,
    styles[`${type.toLowerCase()}-btn`]
  );
  return (
    <button
      id={id}
      data-testid={id}
      className={classnames}
      onClick={onClick}
      disabled={isDisabled}
      title={(isDisabled ? disabledReason : text) || ''}
    >
      {text || children}
    </button>
  );
};
