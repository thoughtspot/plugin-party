import cx from 'classnames';
import { Button } from '../button/index';
import { Horizontal, Vertical } from '../layout/flex-layout';
import { Typography } from '../typography/typography';
import styles from './card.module.scss';

export interface CardProps {
  id: number;
  title: string;
  subTitle?: string;
  firstButton?: string;
  firstButtonType?: 'PRIMARY' | 'SECONDARY';
  onFirstButtonClick?: () => void;
  secondButton?: string;
  secondButtonType?: 'PRIMARY' | 'SECONDARY';
  onSecondButtonClick?: () => void;
  isFirstButtonDisabled?: boolean;
  isSecondButtonDisabled?: boolean;
  isFirstButtonHidden?: boolean;
  isSecondButtonHidden?: boolean;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  children?: any;
}
export const Card: React.FC<CardProps> = ({
  id,
  title,
  subTitle,
  firstButton = '',
  firstButtonType,
  onFirstButtonClick,
  secondButton = '',
  secondButtonType,
  onSecondButtonClick,
  isFirstButtonDisabled = false,
  isSecondButtonDisabled = false,
  isFirstButtonHidden = false,
  isSecondButtonHidden = false,
  className,
  titleClassName,
  subtitleClassName,
  children,
}) => {
  return (
    <div
      data-testid={`card-testid${id}`}
      className={cx(styles.cardWrapper, styles.cardSectionWrapper, className)}
    >
      <Horizontal spacing="e">
        <Vertical>
          <div
            className={cx(styles.title, titleClassName)}
            data-testid={`card-title-testid${id}`}
          >
            {title}
          </div>

          {subTitle !== '' && (
            <p
              className={cx(subtitleClassName, styles.subtitle)}
              dangerouslySetInnerHTML={{ __html: subTitle }}
            ></p>
          )}

          <Horizontal spacing="d" className={styles.actionItems}>
            {!isFirstButtonHidden && firstButton !== '' && (
              <Button
                onClick={onFirstButtonClick}
                text={firstButton}
                type={firstButtonType}
                data-testid={`card-firstbutton-testid${id}`}
                isDisabled={isFirstButtonDisabled}
              />
            )}

            {!isSecondButtonHidden && secondButton !== '' && (
              <Button
                onClick={onSecondButtonClick}
                text={secondButton}
                type={secondButtonType}
                data-testid={`card-secondbutton-testid${id}`}
                isDisabled={isSecondButtonDisabled}
              />
            )}
          </Horizontal>
          <div>{children}</div>
        </Vertical>
      </Horizontal>
    </div>
  );
};
