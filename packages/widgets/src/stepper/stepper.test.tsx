import { render, screen } from '@testing-library/preact';
import { describe, expect, it, vitest } from 'vitest';
import { Stepper } from './index';

const singleStep = [
  {
    title: 'Step 1',
  },
];

const singleSubStep = [
  {
    title: 'Step 1',
    isSubStep: true,
  },
];

const multiSteps = [
  {
    title: 'Step 1',
  },
  {
    title: 'Step 2',
  },
  {
    title: 'Step 3',
  },
];

const multiStepsWithSubSteps = [
  {
    title: 'Step 1',
  },
  {
    title: 'Step 2',
    isSubStep: true,
  },
  {
    title: 'Step 3',
    isSubStep: true,
  },
];

describe('Stepper', () => {
  it('Renders without crashing', () => {
    render(<Stepper steps={singleStep}></Stepper>);
  });

  it('Renders string step titles', () => {
    render(<Stepper steps={multiSteps}></Stepper>);
    expect(screen.getByText(/^Step 1$/)).toBeDefined();
    expect(screen.getByText(/^Step 2$/)).toBeDefined();
    expect(screen.getByText(/^Step 3$/)).toBeDefined();
  });

  it('Renders subStep if strp.isSubStep is true', () => {
    render(<Stepper steps={singleSubStep}></Stepper>);
    const subStepClass = screen.getByTestId('0_stepItem').className;
    expect(subStepClass).toContain('isSubStep');
  });

  it('Renders Step circle accroding to step type', () => {
    render(<Stepper steps={multiStepsWithSubSteps}></Stepper>);
    expect(screen.getByTestId('0_stepCircle')).toBeDefined();
    expect(screen.getByTestId('1_subStepCircle')).toBeDefined();
    expect(screen.getByTestId('2_subStepCircle')).toBeDefined();
  });

  it('Assigns right class as per current step', () => {
    render(<Stepper steps={multiStepsWithSubSteps} currentStep={1}></Stepper>);
    const firstStepClass = screen.getByTestId('0_stepItem').className;
    const secondStepClass = screen.getByTestId('1_stepItem').className;
    const thirdStepClass = screen.getByTestId('2_stepItem').className;
    expect(firstStepClass).toContain('isCompleted');
    expect(secondStepClass).toContain('isActive');
    expect(thirdStepClass).not.toContain('isActive');
    expect(thirdStepClass).not.toContain('isCompleted');
  });
});
