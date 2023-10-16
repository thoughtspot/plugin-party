import cx from 'classnames';
import React from 'react';
import styles from './stepper.module.scss';
import { StepperItem } from './stepper-item';

type StepperType<P> = React.FC<P> & {
  Item: typeof StepperItem;
};

type StepItem = {
  /**
   * Title for the stepper item
   */
  title: string;
  /**
   * if step is substep
   */
  isSubStep?: boolean;
};

interface StepperProps {
  /**
   * Array of Steps which contains the title and onClick callback.
   *
   * title: string | ReactNode; // Title for the stepper item.
   */
  steps: StepItem[];

  /**
   * Current active step index
   * @default 0
   */
  currentStep?: number;

  /**
   * Additional styling for stepper
   * @default ''
   */
  className?: string;
}

export const Stepper: StepperType<StepperProps> = ({
  currentStep = 0,
  steps,
  className = '',
  ...restProps
}: StepperProps) => {
  const stepperWrapper = cx(
    className,
    styles.stepperWrapper,
    styles.verticalStepper,
    styles.sequentialStepper
  );

  return (
    <div className={stepperWrapper} {...restProps}>
      <div className={styles.stepperItemWrapper}>
        {steps.map((step: StepItem, index: number) => {
          const stepNumber = index;
          const isActive = currentStep === index;
          const isCompleted = index < currentStep;
          const { title, isSubStep = false } = step;
          return (
            <Stepper.Item
              key={stepNumber}
              title={title}
              isActive={isActive}
              isCompleted={isCompleted}
              stepNumber={stepNumber}
              isSubStep={isSubStep}
            />
          );
        })}
      </div>
    </div>
  );
};

Stepper.Item = StepperItem;
