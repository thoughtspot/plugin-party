import cx from 'classnames';
import { Card } from '../card';
import { Button } from '../button';
import { Icon } from '../icon';
import { Horizontal } from '../layout/flex-layout';
import { Typography, Colors, Variants } from '../typography';
import styles from './banner.module.scss';

export enum BannerType {
  CARD,
  MESSAGE,
}

export interface ErrorBannerProps {
  errorMessage: string;
  showBanner?: boolean;
  bannerType?: BannerType;
  errorCardButton?: {
    name?: string;
    onClick?: () => void;
  };
  messageSize?: Variants;
  className?: string;
  showCloseIcon?: boolean;
  onCloseIconClick?: (message: string) => void;
}
export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  errorMessage,
  bannerType = BannerType.MESSAGE,
  errorCardButton,
  showBanner = true,
  className,
  messageSize = 'p',
  showCloseIcon = true,
  onCloseIconClick,
}) => {
  return (
    <>
      {showBanner && bannerType === BannerType.MESSAGE && (
        <Horizontal
          vAlignContent="center"
          spacing="e"
          className={cx(styles.errorBanner, className)}
        >
          <Typography variant={messageSize} className={styles.iconTextWrapper}>
            <Icon name="rd-icon-failure" size="s"></Icon>
            {errorMessage}
          </Typography>
          {showCloseIcon && (
            <Button
              type="ICON"
              className={styles.errorButton}
              onClick={onCloseIconClick}
            >
              <Icon
                name="rd-icon-cross"
                size="s"
                iconClassName={styles.icon}
              ></Icon>
            </Button>
          )}
        </Horizontal>
      )}
      {showBanner && bannerType === BannerType.CARD && (
        <Card
          id={0}
          title={'Error Occured'}
          subTitle={errorMessage}
          firstButton={errorCardButton?.name}
          firstButtonType={'PRIMARY'}
          onFirstButtonClick={errorCardButton?.onClick}
        />
      )}
    </>
  );
};
