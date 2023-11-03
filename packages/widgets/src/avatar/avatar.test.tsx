import { render, screen } from '@testing-library/preact';
import { describe, expect, it, vitest } from 'vitest';
import { Avatar } from './index';

describe('Avatar', () => {
  it('Renders without crashing', () => {
    render(<Avatar name={'Test'}></Avatar>);
  });

  it('Renders First letter of name when src is not given', () => {
    render(<Avatar name={'Test'}></Avatar>);
    expect(screen.getAllByText(/T$/)).toBeDefined();
  });

  it('Renders name', () => {
    render(<Avatar name={'Test'} showName={true}></Avatar>);
    expect(screen.getAllByText(/^Test$/)).toBeDefined();
  });

  it('Does not render name', () => {
    render(<Avatar name={'Test'}></Avatar>);
    expect(screen.queryByText(/^Test$/)).toBeFalsy();
  });

  it('Renders image with src', () => {
    render(<Avatar name={'Test'} src="https://imag_src"></Avatar>);
    const avatarImage = screen.getByTestId('_img');
    expect(avatarImage).toBeDefined();
    expect(avatarImage.getAttribute('src')).toBe('https://imag_src');
  });
});
