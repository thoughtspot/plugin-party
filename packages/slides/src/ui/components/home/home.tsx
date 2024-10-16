import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import { Card } from 'widgets/lib/card';
import { useShellContext } from 'gsuite-shell';
import { getSessionInfo } from '@thoughtspot/visual-embed-sdk';
import { ErrorBanner, BannerType } from 'widgets/lib/error-banner';
import { SuccessBanner } from 'widgets/lib/success-banner';
import { Routes } from '../../routes';
import styles from './home.module.scss';
import { getToken } from '../../services/api';

export const Home = () => {
  const loader = useLoader();
  const { run } = useShellContext();
  const { t, pt } = useTranslations();
  const [errorMessage, setErrorMessage] = useState({
    visible: true,
    message: '',
    type: BannerType.CARD,
  });
  const [successMessage, setSuccessMessage] = useState({
    visible: false,
    message: '',
  });
  const [isPrivileged, setIsPrivileged] = useState(false);

  useEffect(() => {
    const getUserInfo = async () => {
      const userInfo = await getSessionInfo();
      const isUserPrivileged =
        userInfo?.privileges?.includes('DATADOWNLOADING') ||
        userInfo?.privileges?.includes('ADMINISTRATION');
      setIsPrivileged(isUserPrivileged);
      if (!isUserPrivileged) {
        setErrorMessage({
          visible: true,
          message: t.PRIVILEGE_REQUIRED,
          type: BannerType.CARD,
        });
        loader.hide();
      }
    };
    getUserInfo();
  }, []);

  useEffect(() => {
    if (isPrivileged) {
      getToken().then((token) => {
        if (token.token) {
          run('setToken', token.token, token.ttl);
          setErrorMessage({
            visible: false,
            message: '',
            type: BannerType.MESSAGE,
          });
        } else {
          setErrorMessage({
            visible: true,
            message: t.TOKEN_FETCH_FAILED,
            type: BannerType.CARD,
          });
        }
        loader.hide();
      });
    }
  }, [isPrivileged]);

  const onReloadImages = (reloadFn: string) => {
    setErrorMessage({
      visible: false,
      message: '',
      type: BannerType.MESSAGE,
    });
    setSuccessMessage({
      visible: false,
      message: '',
    });
    loader.show();
    run(reloadFn)
      .then((arg) => {
        console.log('arg', arg);
        if (arg?.successImages?.length) {
          const numberOfImagesUpdated = arg?.successImages?.length;
          setSuccessMessage({
            visible: true,
            message: pt(t.IMAGE_UPDATE_SUCCESS_MESSAGE, {
              NoOfUpdatedImages: numberOfImagesUpdated,
            }),
          });
        }
        if (arg?.errorImages?.length) {
          const numberOfImagesFailed = arg?.errorImages?.length;
          const errorCode = arg?.errorImages[0]?.errorCode;
          const sessionInvalidMessage =
            errorCode === 401
              ? t.SESSION_EXPIRED_MESSAGE
              : t.IMAGE_UPDATE_FAILURE_MESSAGE;
          const errorMessageToDisplay =
            errorCode === 400
              ? pt(t.INVALID_INSERT_FAILURE_MESSAGE, {
                  NoOfFailedImages: numberOfImagesFailed,
                })
              : sessionInvalidMessage;
          setErrorMessage({
            visible: true,
            message: errorMessageToDisplay,
            type: BannerType.MESSAGE,
          });
        }
      })
      .finally(() => loader.hide());
  };

  return (
    <Vertical className={styles.home} spacing="f">
      <SuccessBanner
        successMessage={successMessage.message}
        showCloseIcon
        onCloseIconClick={() =>
          setSuccessMessage({ ...successMessage, visible: false })
        }
        showBanner={successMessage.visible && !!successMessage.message}
      />
      <ErrorBanner
        errorMessage={errorMessage.message}
        bannerType={errorMessage.type}
        errorCardButton={{
          name: '',
        }}
        showCloseIcon={!!errorMessage.type}
        onCloseIconClick={() =>
          setErrorMessage({ ...errorMessage, visible: false })
        }
        showBanner={errorMessage.visible && !!errorMessage.message}
      />
      {((!errorMessage.visible && !errorMessage.message) ||
        !(errorMessage.type === BannerType.CARD)) && (
        <>
          <Card
            id={0}
            title={t.INSERT_TS_VIZ}
            subTitle={t.INSERT_TS_VIZ_DESCRIPTION}
            firstButton={t.BROWSE_TS}
            firstButtonType={'PRIMARY'}
            onFirstButtonClick={() => route(Routes.LIVEBOARDLIST)}
          />
          <Card
            id={1}
            title={t.UPDATE_VIZ}
            subTitle={t.UPDATE_VIZ_DESCRIPTION}
            firstButton={t.UPDATE_ALL_VIZ}
            firstButtonType="SECONDARY"
            onFirstButtonClick={() =>
              onReloadImages('reloadImagesInPresentation')
            }
            secondButton={t.UPDATE_VIZ_IN_SLIDE}
            secondButtonType={'SECONDARY'}
            onSecondButtonClick={() =>
              onReloadImages('reloadImagesInCurrentSlide')
            }
          />
        </>
      )}
    </Vertical>
  );
};
