import { useEffect, useState } from 'preact/hooks';
import { route, useRouter } from 'preact-router';
import { setAutoHideLoader, useLoader } from 'widgets/lib/loader';
import { Button } from 'widgets/lib/button';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Radio } from 'widgets/lib/radio';
import { useTranslations } from 'i18n';
import { Card } from 'widgets/lib/card';
import cx from 'classnames';
import { useShellContext } from 'gsuite-shell';
import { getSessionInfo, logout } from '@thoughtspot/visual-embed-sdk';
import { ErrorBanner, BannerType } from 'widgets/lib/error-banner';
import { WarningBanner } from 'widgets/lib/warning-banner';
import { SuccessBanner } from 'widgets/lib/success-banner';
import { FrequencyPicker } from 'widgets/lib/frequency-picker';
import { Tab, TabItem } from 'widgets/lib/tab';
import { Typography } from 'widgets/lib/typography';
import { Routes } from '../../routes';
import styles from './home.module.scss';
import { getToken } from '../../services/api';
import { updateVizType } from '../../services/services.util';
import { useAppContext } from '../app.context';
import { runPluginFn } from '../../../utils/plugin-utils';
import {
  reloadImagesInCurrentSlide,
  reloadImagesInPresentation,
  setToken,
} from '../../../utils/ppt-code';

export const Home = ({ isPowerpoint = false }) => {
  const loader = useLoader();
  const { run } = useShellContext();
  const { t, pt } = useTranslations();

  const { setIsPowerpoint } = useAppContext();

  const [selectedTabId, setSelectedTabId] = useState(updateVizType.MANUAL);
  const [selectedManualUpdate, setSelectedManualUpdate] = useState(
    t.SLIDES_MANUAL_UPDATE_ALL
  );
  const [isScheduleSet, setIsScheduleSet] = useState(false);

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
  const [isReloading, setIsReloading] = useState(false);

  const onManualTabClick = () => {
    setSelectedTabId(updateVizType.MANUAL);
  };

  const onScheduleTabClick = () => {
    setSelectedTabId(updateVizType.SCHEDULE);
  };

  const onManualUpdateChange = (e) => {
    setSelectedManualUpdate(e.target.value);
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

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
    setIsPowerpoint(isPowerpoint);
  }, []);

  useEffect(() => {
    if (isPrivileged) {
      getToken().then((token) => {
        if (token.token) {
          runPluginFn(
            isPowerpoint,
            run,
            setToken,
            'setToken',
            token.token,
            token.ttl
          );
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

  const onReloadImages = async () => {
    if (isPowerpoint && isReloading) {
      console.log('Reload already in progress, ignoring this request');
      return;
    }

    if (isPowerpoint) {
      setIsReloading(true);
    }

    const reloadFn =
      selectedManualUpdate === t.SLIDES_MANUAL_UPDATE_ALL
        ? runPluginFn(
            isPowerpoint,
            run,
            reloadImagesInPresentation,
            'reloadImagesInPresentation'
          )
        : runPluginFn(
            isPowerpoint,
            run,
            reloadImagesInCurrentSlide,
            'reloadImagesInCurrentSlide'
          );
    setErrorMessage({
      visible: false,
      message: '',
      type: BannerType.MESSAGE,
    });
    setSuccessMessage({
      visible: false,
      message: '',
    });
    setAutoHideLoader(false);
    loader.show();
    reloadFn
      .then((arg) => {
        if (isPowerpoint) {
          setIsReloading(false);
        }
        if (
          arg?.successImages?.length === 0 &&
          arg?.errorImages?.length === 0
        ) {
          setErrorMessage({
            visible: true,
            message: t.NO_IMAGES_TO_UPDATE,
            type: BannerType.MESSAGE,
          });
        }
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
      .finally(() => {
        loader.hide();
      });
  };
  const handleScheduleSet = async (scheduleData) => {
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
    try {
      await run('scheduleReloadImages', scheduleData);
      setIsScheduleSet(true);
      setSuccessMessage({ visible: true, message: t.SCHEDULE_SUCCESSFUL_MSG });
    } catch (error) {
      console.log('error', error);
      setErrorMessage({
        visible: true,
        message: t.SCHEDULE_FAILURE_MSG,
        type: BannerType.MESSAGE,
      });
    } finally {
      loader.hide();
    }
  };

  const onScheduleDelete = async () => {
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
    try {
      await run('deleteExistingTriggers', [
        'reloadImagesInPresentation',
        'checkAndReloadImages',
      ]);
      loader.hide();
      setSuccessMessage({
        visible: true,
        message: t.SCHEDULE_DELETE_SUCCESSFUL_MSG,
      });
    } catch (error) {
      console.error('error', error);
      setErrorMessage({
        visible: true,
        message: t.SCHEDULE_DELETE_FAILURE_MSG,
        type: BannerType.MESSAGE,
      });
      loader.hide();
    }
  };

  const renderTabHeader = (tabId: string, type: string) => {
    return (
      <Vertical
        hAlignContent="center"
        className={cx({
          [styles.tabIcon]: selectedTabId !== tabId,
        })}
      >
        <Typography variant="p" noMargin color="">
          {type}
        </Typography>
      </Vertical>
    );
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
      {isPowerpoint && isReloading && (
        <WarningBanner
          bannerType={BannerType.MESSAGE}
          warningMessage={t.UPDATE_IMAGE_WARNING}
          showBanner={true}
          onCloseIconClick={() => setIsReloading(false)}
        />
      )}
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
            isBottomBorderHidden={isPowerpoint}
            className={isPowerpoint ? styles.card : ''}
            cardContainerClassName={isPowerpoint ? styles.cardContainer : ''}
          />
          {isPowerpoint && (
            <>
              <Button
                className={styles.logoutButton}
                onClick={handleLogout}
                text="Logout of ThoughtSpot"
                type="SECONDARY"
              />
              <div className={styles.breakline}></div>
            </>
          )}
          <Vertical className={styles.tabContainer}>
            <Typography variant="p" className={styles.title} noMargin>
              {t.UPDATE_VIZ}
            </Typography>
            {!isPowerpoint && (
              <Tab
                selectedTabId={selectedTabId}
                className={styles.tabHeader}
                tabHorizontalClassName={styles.tabWrapper}
              >
                <TabItem
                  id={updateVizType.MANUAL}
                  onTabItemClick={onManualTabClick}
                  customHeader={renderTabHeader(
                    updateVizType.MANUAL,
                    t.SLIDES_MANUAL_UPDATE
                  )}
                ></TabItem>
                <TabItem
                  id={updateVizType.SCHEDULE}
                  onTabItemClick={onScheduleTabClick}
                  customHeader={renderTabHeader(
                    updateVizType.SCHEDULE,
                    t.SLIDES_SCHEDULE_UPDATE
                  )}
                ></TabItem>
              </Tab>
            )}
            {selectedTabId === updateVizType.MANUAL && (
              <>
                <Typography variant="p" className={styles.subtitle}>
                  {t.UPDATE_VIZ_DESCRIPTION}
                </Typography>
                <Horizontal>
                  <Radio
                    value={t.SLIDES_MANUAL_UPDATE_ALL}
                    checked={
                      selectedManualUpdate === t.SLIDES_MANUAL_UPDATE_ALL
                    }
                    label={t.SLIDES_MANUAL_UPDATE_ALL}
                    onChange={onManualUpdateChange}
                  />
                  <Radio
                    value={t.SLIDES_MANUAL_UPDATE_CURRENT}
                    checked={
                      selectedManualUpdate === t.SLIDES_MANUAL_UPDATE_CURRENT
                    }
                    label={t.SLIDES_MANUAL_UPDATE_CURRENT}
                    onChange={onManualUpdateChange}
                  />
                </Horizontal>
                <Button
                  type="SECONDARY"
                  text="Update"
                  className={styles.updateButton}
                  onClick={onReloadImages}
                ></Button>
              </>
            )}
            {selectedTabId === updateVizType.SCHEDULE && (
              <FrequencyPicker
                isScheduleSet={isScheduleSet}
                setIsScheduleSet={setIsScheduleSet}
                onScheduleSubmit={handleScheduleSet}
                onScheduleDelete={onScheduleDelete}
              />
            )}
          </Vertical>
        </>
      )}
    </Vertical>
  );
};
