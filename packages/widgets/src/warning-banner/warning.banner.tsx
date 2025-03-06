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

export interface WarningBannerProps {
  warningMessage: string;
  showBanner?: boolean;
  bannerType?: BannerType;
  warningCardButton?: {
    name?: string;
    onClick?: () => void;
  };
  messageSize?: Variants;
  className?: string;
  showCloseIcon?: boolean;
  onCloseIconClick?: (message: string) => void;
}
export const WarningBanner: React.FC<WarningBannerProps> = ({
  warningMessage,
  bannerType = BannerType.MESSAGE,
  warningCardButton,
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
          className={cx(styles.warningBanner, className)}
        >
          <Typography variant={messageSize} className={styles.iconTextWrapper}>
            <Icon name="rd-icon-warning" size="s"></Icon>
            {warningMessage}
          </Typography>
          {showCloseIcon && (
            <Button
              type="ICON"
              className={styles.warningButton}
              onClick={onCloseIconClick}
            >
              <Icon name="rd-icon-cross" size="s"></Icon>
            </Button>
          )}
        </Horizontal>
      )}
      {showBanner && bannerType === BannerType.CARD && (
        <Card
          id={0}
          title={'Error Occured'}
          subTitle={warningMessage}
          firstButton={warningCardButton?.name}
          firstButtonType={'PRIMARY'}
          onFirstButtonClick={warningCardButton?.onClick}
        />
      )}
    </>
  );
};
