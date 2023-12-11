import cx from 'classnames';
import { FunctionComponent } from 'preact';
import FlexView from 'react-flexview';
import styles from './flex-layout.module.scss';

/**
 * These are the Design System spacing symbols.
 * a: 4px, b: 8px, c: 12px, d: 16px, e:20px
 * f: 24px, g: 28px, h: 32px, i: 40px, j: 48px
 * k: 56px, l: 64px
 */
export type Spacing = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j';

type LayoutProps = FlexView.Props & {
  spacing?: Spacing;
  minHeight?: string | number;
};

type HorizontalLayoutProps = {
  vAlignContent?: 'stretch' | 'center' | 'start' | 'end';
} & Omit<LayoutProps, 'vAlignContent'>;

type VerticalLayoutProps = {
  hAlignContent?: 'stretch' | 'center' | 'start' | 'end';
} & Omit<LayoutProps, 'hAlignContent'>;

type AnyLayoutProps = LayoutProps | HorizontalLayoutProps | VerticalLayoutProps;

function fixProps<T extends AnyLayoutProps>(props: T): T {
  const fixedProps = { ...props };

  // https://github.com/buildo/react-flexview/issues/83
  if (fixedProps.basis === 0) {
    fixedProps.basis = '0px';
  }

  return fixedProps;
}

export const View: FunctionComponent<LayoutProps> = (props) => {
  const { spacing, className, ...flexProps } = fixProps(props);
  const spacingClassName = spacing ? styles[`spacing-${spacing}`] : '';
  // Done to avoid the type error, which doesn't seem to be fixable.
  const FlexViewAny: any = FlexView;
  return (
    <FlexViewAny className={cx(className, spacingClassName)} {...flexProps} />
  );
};

export const Horizontal: FunctionComponent<HorizontalLayoutProps> = (
  props: HorizontalLayoutProps
) => {
  const { vAlignContent, minHeight, ...rest } = fixProps(props);
  return (
    <View
      {...rest}
      className={cx(props.className, styles.horizontal)}
      style={{ alignItems: vAlignContent, minHeight }}
    />
  );
};

export const Vertical: FunctionComponent<VerticalLayoutProps> = (props) => {
  const { hAlignContent, minHeight, ...rest } = fixProps(props);
  return (
    <View
      {...rest}
      className={cx(props.className, styles.vertical)}
      column
      style={{ alignItems: hAlignContent, minHeight }}
    />
  );
};
