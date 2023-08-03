import { SearchEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { Action, EmbedEvent } from '@thoughtspot/visual-embed-sdk';
import { useRouter } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { useShellContext } from 'gsuite-shell';
import { useLoader } from 'widgets/lib/loader';
import { Typography, Colors } from 'widgets/lib/typography';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Button } from 'widgets/lib/button';
import { Icon } from 'widgets/lib/icon';
import styles from './answer.module.scss';
import { getTSAnswerLink } from '../../utils';
import { exportAnswer } from '../../services/api';
import { customCSSProperties } from './answer.util';

export const Answer = () => {
  const [router] = useRouter();
  const [showError, setShowError] = useState(false);
  const loader = useLoader();
  const answerId = router?.matches?.id;
  const ref = useEmbedRef();
  const { run } = useShellContext();
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const link = getTSAnswerLink(answerId);
    run('preCacheImage', link);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ref.current.on(Action.InsertInToSlide, (e) => {
      loader.show();
      setShowError(false);
      run('addImage', link)
        .then(() => {
          loader.hide();
        })
        .catch((error) => {
          loader.hide();
          setShowError(true);
        });
    });
  }, [ref.current]);
  return (
    <Vertical className={styles.answerIframe}>
      {showError && (
        <Horizontal
          vAlignContent="center"
          spacing="e"
          className={styles.errorBanner}
        >
          <Typography variant="h6" noMargin color={Colors.failure}>
            Insert Failed Please Try again
          </Typography>
          <Button
            type="ICON"
            className={styles.errorButton}
            onClick={() => setShowError(false)}
          >
            <Icon name="rd-icon-column" size="xs"></Icon>
          </Button>
        </Horizontal>
      )}
      <SearchEmbed
        ref={ref}
        answerId={answerId}
        insertInToSlide={true}
        hideDataSources={true}
        visibleActions={[Action.InsertInToSlide]}
        className={styles.answerIframe}
        customizations={{
          style: {
            customCSS: {
              rules_UNSTABLE: customCSSProperties,
            },
          },
        }}
      />
    </Vertical>
  );
};
