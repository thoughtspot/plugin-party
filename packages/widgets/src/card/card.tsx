import cx from 'classnames';
import { useState } from 'preact/compat';
import { Button } from '../button/index';
import { Horizontal, Vertical } from '../layout/flex-layout';
import { Typography } from '../typography/typography';
import styles from './card.module.scss';
import { Radio } from '../radio/index';

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
  isFirstRadioBoxHidden?: boolean;
  isSecondRadioBoxHidden?: boolean;
  firstRadioButtonText?: string;
  secondRadioButtonText?: string;
  defaultRadioSelected?: string;
  onRadioSelectionChange?: (value: string) => void;
  isBottomBorderHidden?: boolean;
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
  isFirstRadioBoxHidden = false,
  isSecondRadioBoxHidden = false,
  firstRadioButtonText = '',
  secondRadioButtonText = '',
  defaultRadioSelected = '',
  onRadioSelectionChange,
  isBottomBorderHidden = false,
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultRadioSelected);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    onRadioSelectionChange(value);
  };
  return (
    <div
      data-testid={`card-testid${id}`}
      className={cx(styles.cardWrapper, className, {
        [styles.bottomBorder]: !isBottomBorderHidden,
      })}
    >
      <Horizontal spacing="e">
        <Vertical className={styles.cardContainer}>
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

          {(firstRadioButtonText || secondRadioButtonText) && (
            <Horizontal className={styles.radioActionItems}>
              {!isFirstRadioBoxHidden && firstRadioButtonText && (
                <Radio
                  value={firstRadioButtonText}
                  checked={selectedValue === firstRadioButtonText}
                  label={firstRadioButtonText}
                  onChange={handleChange}
                />
              )}
              {!isSecondRadioBoxHidden && secondRadioButtonText && (
                <Radio
                  value={secondRadioButtonText}
                  checked={selectedValue === secondRadioButtonText}
                  label={secondRadioButtonText}
                  onChange={handleChange}
                />
              )}
            </Horizontal>
          )}

          <Horizontal className={styles.actionItems}>
            {!isFirstButtonHidden && firstButton !== '' && (
              <Button
                onClick={onFirstButtonClick}
                text={firstButton}
                type={firstButtonType}
                data-testid={`card-firstbutton-testid${id}`}
                isDisabled={isFirstButtonDisabled}
                className={cx({
                  [styles.button]: firstButton !== '' && secondButton === '',
                })}
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
