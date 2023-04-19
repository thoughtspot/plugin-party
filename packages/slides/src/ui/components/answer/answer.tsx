import { SearchEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { Action, EmbedEvent } from '@thoughtspot/visual-embed-sdk';
import { useRouter } from 'preact-router';
import { useEffect } from 'preact/hooks';
import { useShellContext } from 'gsuite-shell';
import { useLoader } from 'widgets/lib/loader';
import { exportAnswer } from '../../services/api';
import { getTSAnswerLink } from '../../utils';
import styles from './answer.module.scss';

export const Answer = () => {
  const [router] = useRouter();
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
      run('addImage', link).then(() => {
        loader.hide();
      });
    });
  }, [ref.current]);
  return (
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
            rules_UNSTABLE: {
              body: {
                zoom: '0.6',
              },
              '.app-module__blink': {
                width: '100% !important',
                height: '100% !important',
              },
              '.sage-search-bar-module__undoRedoResetWrapper': {
                display: 'none !important',
              },
              '.answer-edit-panel-module__answerConfigPanel': {
                display: 'none !important',
              },
              '.answer-actions-container-module__insertToSlideBtn': {
                zoom: '1.5',
              },
              '.authenticated-app-view-module__blink': {
                width: '100% !important',
                height: '100% !important',
              },
            },
          },
        },
      }}
    />
  );
};
