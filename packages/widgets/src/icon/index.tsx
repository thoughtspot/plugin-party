import cx from 'classnames';
import styles from './icon.module.scss';

interface IconProps {
  name: string;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  subscript?: string;
  onClick?: () => void;
  iconClassName?: string;
}
/**
 * Sample Usage:
 * <Icon name="rd-icon-xxx" size="s" />
 * @param props
 * @returns
 */
export const Icon = (props: IconProps) => {
  const classes = cx(styles.icon, styles[props.size], props.iconClassName);
  return (
    <div className={styles.wrapper} onClick={props.onClick}>
      <svg className={classes}>
        <use xlinkHref={`#${props.name}`} />
      </svg>
      {props.subscript && (
        <span className={cx(styles.badge)}>{props.subscript}</span>
      )}
    </div>
  );
};
