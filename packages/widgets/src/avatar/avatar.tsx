/**
 * @overview Avatar component
 */

import cx from 'classnames';
import _ from 'lodash';
import React, { FC, useEffect } from 'preact/compat';
import { Typography } from '../typography/typography';
import styles from './avatar.module.scss';
import { getRandomBgClassNameFromName } from './avatar-util';

export type AvatarSize = 'xs' | 's';

export interface AvatarProps {
  /**
   * Name of the user or business
   */
  name: string;

  /**
   * unique id
   */
  id?: string;

  /**
   * Avatar container class name
   */
  className?: string;

  /**
   * Source of the image
   * @default ''
   */
  src?: string;

  /**
   * If true, name will be displayed next to the avatar
   * @default false
   */
  showName?: boolean;

  /**
   * Size of the avatar
   * @default 'xs'
   */
  size?: AvatarSize;
}

export const Avatar: FC<AvatarProps> = ({
  name,
  id,
  className = '',
  src = '',
  showName = false,
  size = 'xs',
  ...restProps
}: AvatarProps) => {
  const rootClassNames = cx(
    styles.root,
    className,
    styles[`size-${size}`],
    styles.nameRight
  );
  const [isImageExists, setIsImageExists] = React.useState(!!src);

  useEffect(() => {
    setIsImageExists(!!src);
  }, [src]);

  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const randomBgClassName = getRandomBgClassNameFromName(id || name);

  const renderText = () => {
    return (
      showName &&
      name && (
        <Typography variant="h6" className={cx(styles.name)}>
          {name}
        </Typography>
      )
    );
  };

  return (
    <div id={id} className={rootClassNames} {...restProps}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          {name && !isImageExists && (
            <span className={cx(styles.initial, styles[randomBgClassName])}>
              {name[0]}
            </span>
          )}
          {src && isImageExists && (
            <img
              loading="lazy"
              className={cx(styles.avatarImage, {
                [styles.loaded]: isImageLoaded,
              })}
              alt={name}
              onError={() => {
                setIsImageExists(false);
              }}
              onLoad={() => {
                setIsImageLoaded(true);
              }}
              src={src}
            />
          )}
        </div>
      </div>
      {renderText()}
    </div>
  );
};
