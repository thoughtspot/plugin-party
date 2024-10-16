import cx from 'classnames';
import { Button } from '../button';
import { Icon } from '../icon';
import { Horizontal } from '../layout/flex-layout';
import { Typography, Colors, Variants } from '../typography';
import styles from './banner.module.scss';

export interface SuccessBannerProps {
  successMessage: string;
  showBanner?: boolean;
  messageSize?: Variants;
  className?: string;
  showCloseIcon?: boolean;
  onCloseIconClick?: (message: string) => void;
}
export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  successMessage,
  showBanner = true,
  className,
  messageSize = 'p',
  showCloseIcon = true,
  onCloseIconClick,
}) => {
  return (
    <>
      {showBanner && (
        <Horizontal
          vAlignContent="center"
          spacing="e"
          className={cx(styles.successBanner, className)}
        >
          <Typography variant={messageSize} className={styles.iconTextWrapper}>
            <Icon name="rd-icon-correct" size="s"></Icon>
            {successMessage}
          </Typography>
          {showCloseIcon && (
            <Button
              type="ICON"
              className={styles.successButton}
              onClick={onCloseIconClick}
            >
              <Icon name="rd-icon-cross" size="s"></Icon>
            </Button>
          )}
        </Horizontal>
      )}
    </>
  );
};
