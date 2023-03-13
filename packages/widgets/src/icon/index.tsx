import './icon.scss';
import cx from 'classnames';

interface IconProps {
  name: string;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  subscript?: string;
}
/**
 * Sample Usage:
 * <Icon name="rd-icon-xxx" size="s" />
 * @param props
 * @returns
 */
export const Icon = (props: IconProps) => {
  const classes = cx('icon', props.size);
  return (
    <>
      <svg className={classes}>
        <use xlinkHref={`#${props.name}`} />
      </svg>
    </>
  );
};
