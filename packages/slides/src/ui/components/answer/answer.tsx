import { SearchEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { Action, EmbedEvent } from '@thoughtspot/visual-embed-sdk';
import { useRouter } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { useShellContext } from 'gsuite-shell';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import { ErrorBanner } from 'widgets/lib/error-banner';
import { SuccessBanner } from 'widgets/lib/success-banner';
import styles from './answer.module.scss';
import { getTSAnswerLink } from '../../utils';
import { customCSSProperties } from './answer.util';
import { runPluginFn } from '../../../utils/plugin-utils';
import { addImageQueued } from '../../../utils/ppt-code';
import { useAppContext } from '../app.context';

export const Answer = () => {
  const [router] = useRouter();
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const { t } = useTranslations();
  const { isPowerpoint } = useAppContext();
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
      setErrorMessage({ ...errorMessage, visible: false });
      setSuccess(false);
      runPluginFn(isPowerpoint, run, addImageQueued, 'addImage', link)
        .then((res) => {
          loader.hide();
          if (res === 200) {
            setSuccess(true);
          } else if (res === 401) {
            setErrorMessage({
              message: t.SESSION_EXPIRED_MESSAGE,
              visible: true,
            });
          } else {
            setErrorMessage({
              message: t.INSERT_FAILURE_MESSAGE,
              visible: true,
            });
          }
        })
        .catch((error) => {
          loader.hide();
        });
    });
  }, [ref.current]);
  return (
    <Vertical className={styles.answerIframe}>
      <SuccessBanner
        successMessage={t.IMAGE_INSERT_SUCCESS_MESSAGE}
        showBanner={success}
        onCloseIconClick={() => setSuccess(false)}
        className={styles.succesBanner}
      />
      <ErrorBanner
        errorMessage={errorMessage.message}
        showBanner={errorMessage.visible}
        onCloseIconClick={() =>
          setErrorMessage({ ...errorMessage, visible: false })
        }
        className={styles.errorBanner}
      />
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
