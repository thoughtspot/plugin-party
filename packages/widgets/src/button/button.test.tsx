import { render, screen } from '@testing-library/preact';
import { describe, expect, it, vitest } from 'vitest';
import { Button } from './index';

const dummyMethod = vitest.fn();

describe('Button', () => {
  it('Renders without crashing', () => {
    render(<Button onClick={dummyMethod}></Button>);
  });

  it('Renders with correct name', () => {
    render(<Button onClick={dummyMethod}>Test Button</Button>);
    expect(screen.getByText(/^Test Button$/)).toBeTruthy();
  });

  it('Renders with correct test id', async () => {
    render(
      <Button onClick={dummyMethod} id={'Button-1'}>
        Test Button
      </Button>
    );
    expect(await screen.findAllByTestId('Button-1')).toBeTruthy();
  });

  it('Renders PRIMARY button when type is not mentioned', async () => {
    render(
      <Button onClick={dummyMethod} id={'Button-1'}>
        Test Button
      </Button>
    );
    const buttonClassName = screen.getByTestId('Button-1').className;
    expect(buttonClassName).toContain('primary-btn');
  });

  it('Renders SECONDARY button when type is SECONDARY', async () => {
    render(
      <Button onClick={dummyMethod} id={'Button-1'} type="SECONDARY">
        Test Button
      </Button>
    );
    const buttonClassName = screen.getByTestId('Button-1').className;
    expect(buttonClassName).toContain('secondary-btn');
  });

  it('Renders diabled button when isDisabled is true', async () => {
    render(
      <Button onClick={dummyMethod} id={'Button-1'} isDisabled={true}>
        Test Button
      </Button>
    );
    const buttonAttributes = screen.getByTestId('Button-1').getAttributeNames();
    expect(buttonAttributes).includes('disabled');
  });
});
