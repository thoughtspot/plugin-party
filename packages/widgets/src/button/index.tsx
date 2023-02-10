import './button.scss';
import cx from 'classnames';

export interface ButtonProps {
  type?: 'PRIMARY' | 'SECONDARY';
  className?: string;
  text: string;
  onClick: (e) => void;
  id?: string;
}

export const Button = ({
  type = 'PRIMARY',
  className,
  text,
  onClick,
  id,
}: ButtonProps) => {
  const classnames = cx(className, 'btn', {
    'primary-btn': type === 'PRIMARY',
    'secondary-btn': type === 'SECONDARY',
  });
  return (
    <button id={id} className={classnames} onClick={onClick}>
      {text}
    </button>
  );
};
