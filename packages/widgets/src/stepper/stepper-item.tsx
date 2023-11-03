import cx from 'classnames';
import _ from 'lodash';
import { Typography } from '../typography';
import styles from './stepper.module.scss';

export interface StepperItemProps {
  /**
   * Current step number.
   */
  stepNumber: number;

  /**
   * State of stepper item as active.
   */
  isActive: boolean;

  /**
   * State of stepper item as completed.
   */
  isCompleted: boolean;

  /**
   * Boolean to set step as sub step
   */
  isSubStep: boolean;

  /**
   * Title for the Step
   */
  title: string;
}

export const StepperItem: React.FC<StepperItemProps> = ({
  stepNumber,
  isActive,
  isCompleted,
  title,
  isSubStep = false,
}: StepperItemProps) => {
  const stepItemMainClass = cx(styles.stepItemMain, {
    [styles.isActive]: isActive,
    [styles.isSubStep]: isSubStep,
    [styles.isCompleted]: isCompleted,
  });

  const renderStepCircle = () => {
    return (
      <div
        className={styles.stepCircle}
        data-testid={
          isSubStep ? `${stepNumber}_subStepCircle` : `${stepNumber}_stepCircle`
        }
      ></div>
    );
  };

  const renderStepTitle = () => {
    return (
      <Typography
        variant="p"
        className={styles.stepTitle}
        ellipsis={{ rows: 1 }}
        noMargin
      >
        {title}
      </Typography>
    );
  };

  return (
    <div className={stepItemMainClass} data-testid={`${stepNumber}_stepItem`}>
      <div
        className={styles.stepItem}
        role="tab"
        aria-current={!!isActive}
        tabIndex={-1}
      >
        {renderStepCircle()}
        {renderStepTitle()}
      </div>
      <div className={styles.connector} />
    </div>
  );
};
