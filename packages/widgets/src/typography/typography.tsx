import cx from 'classnames';
import _ from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'preact/compat';
import DOMPurify from 'dompurify';
import styles from './typography.module.scss';

export const variantToLineHeightMapping = {
  hero: 56,
  h1: 40,
  h2: 32,
  h3: 28,
  h4: 24,
  h5: 24,
  h6: 16,
  p: 20,
};

/** Mapping variant wuth tag & styles */
export const defaultVariantMapping = {
  hero: { type: 'h1', style: 'hero' },
  h1: { type: 'h1', style: 'h1' },
  h2: { type: 'h2', style: 'h2' },
  h3: { type: 'h3', style: 'h3' },
  h4: { type: 'h4', style: 'h4' },
  h5: { type: 'h5', style: 'h5' },
  h6: { type: 'h6', style: 'h6' },
  p: { type: 'p', style: 'p' },
};

/** Colors Mapping */
export enum Colors {
  base = 'base',
  gray = 'gray',
  grayLight = 'grayLight',
  accent = 'accent',
  warning = 'warning',
  success = 'success',
  failure = 'failure',
  white = 'white',
}

export type Variants = keyof typeof defaultVariantMapping;

export interface TypographyProps {
  /** varint type to be returns as valid React Node
   */
  variant: Variants;

  /** valid react node children */
  children: any;

  /** styling tag with the color config */
  color?: Colors | string;

  /** Additional css to be applied to variant tag
   * @default ''
   */
  className?: string;

  /**
   * To show Ellipsis `...` when text doesnt fit the specified number of rows.
   * Takes an object as { rows: number } where rows are the number of lines beyond which if the text goes, it will be truncated and the ellipsis would be shown
   *
   * NOTE: Ellipsis won't work properly with padding applied. If required then add padding on the parent div.
   */
  ellipsis?: { rows: number };

  /**
   * preserve the whitespace characters in the content children.
   */
  preserveWhitespace?: boolean;

  /**
   * no padding on typography
   * @default false
   */
  noMargin?: boolean;

  /**
   * decides if content should be wrapped or not
   * @default false
   */
  wrapContent?: boolean;

  /**
   * On click function
   */
  onClick?: any;

  htmlContent?: string;
}

export const Typography: FC<TypographyProps> = ({
  variant,
  children,
  color = Colors.base,
  className: additionalClass = '',
  ellipsis,
  preserveWhitespace = true,
  noMargin = false,
  wrapContent = false,
  htmlContent,
  ...restProps
}: TypographyProps) => {
  const [contentRef, setContentRef] = useState<HTMLElement | null>(null);
  const [showEllipsis, setShowEllipsis] = useState<boolean>(false);

  // Setting showEllipsis to true if content overflows i.e is when its original height/width
  // is greater than the maxHeight/maxWidth possible as per the ellipsis setting
  useEffect(() => {
    if (ellipsis && !showEllipsis && contentRef) {
      const childrenIsString = _.isString(children);
      if (childrenIsString) {
        const lineHeight = variantToLineHeightMapping[variant];
        const rows = ellipsis ? ellipsis.rows : 1;
        const maxHeight = lineHeight * rows;
        const isOverflow =
          maxHeight < contentRef.clientHeight ||
          contentRef.offsetWidth < contentRef.scrollWidth;
        if (isOverflow) {
          setShowEllipsis(true);
        }
      }
    }

    if (!ellipsis && showEllipsis) {
      setShowEllipsis(false);
    }
  }, [ellipsis, contentRef, showEllipsis, children, variant]);

  const callbackRef = useCallback(
    (node) => {
      if (contentRef === null && node !== null) {
        setContentRef(node);
      }
    },
    // We need to set the ref only once when the ref is ready, hence disabling the 'missing dependency' lint warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { style, type } = defaultVariantMapping[variant];
  const variantStyle = cx(styles[style]);
  const currentTag = type;
  const props = {
    ref: callbackRef,
    className: cx(variantStyle, styles[color], additionalClass, {
      [styles.whiteSpace]: preserveWhitespace,
      [styles.noMargin]: noMargin || ellipsis,
      [styles.ellipsis]: showEllipsis,
      [styles.wrapContent]: wrapContent,
    }),
    style: showEllipsis ? { WebkitLineClamp: `${ellipsis?.rows}` } : {},
    ...restProps,
  };

  const sanitizedHtmlContent = htmlContent
    ? DOMPurify.sanitize(htmlContent)
    : '';

  const element = sanitizedHtmlContent ? (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }}
      {...props}
    />
  ) : (
    React.createElement(currentTag as any, props, children)
  );

  return element;
};
