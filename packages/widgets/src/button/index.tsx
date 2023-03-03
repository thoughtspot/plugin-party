import cx from 'classnames';
import styles from './button.module.scss';

export interface ButtonProps {
  type?: 'PRIMARY' | 'SECONDARY';
  className?: string;
  text: string;
  onClick: (e) => void;
  id?: string;
  isDisabled?: boolean;
}

export const Button = ({
  type = 'PRIMARY',
  className,
  text,
  onClick,
  id,
  isDisabled,
}: ButtonProps) => {
  const classnames = cx(
    className,
    styles.btn,
    styles[`${type.toLowerCase()}-btn`]
  );
  return (
    <button
      id={id}
      className={classnames}
      onClick={onClick}
      disabled={isDisabled}
    >
      {text}
    </button>
  );
};
