import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useLoader } from 'widgets/lib/loader';
import { Button } from 'widgets/lib/button';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Radio } from 'widgets/lib/radio';
import { useTranslations } from 'i18n';
import { Card } from 'widgets/lib/card';
import cx from 'classnames';
import { useShellContext } from 'gsuite-shell';
import { getSessionInfo } from '@thoughtspot/visual-embed-sdk';
import { ErrorBanner, BannerType } from 'widgets/lib/error-banner';
import { SuccessBanner } from 'widgets/lib/success-banner';
import { FrequencyPicker } from 'widgets/lib/frequency-picker';
import { Tab, TabItem } from 'widgets/lib/tab';
import { Typography } from 'widgets/lib/typography';
import { Routes } from '../../routes';
import styles from './home.module.scss';
import { getToken } from '../../services/api';
import { updateVizType } from '../../services/services.util';

export const Home = () => {
  const loader = useLoader();
  const { run } = useShellContext();
  const { t, pt } = useTranslations();

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

  const onManualTabClick = () => {
    setSelectedTabId(updateVizType.MANUAL);
  };

  const onScheduleTabClick = () => {
    setSelectedTabId(updateVizType.SCHEDULE);
  };

  const onManualUpdateChange = (e) => {
    setSelectedManualUpdate(e.target.value);
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

  const onReloadImages = () => {
    const reloadFn = t.SLIDES_MANUAL_UPDATE_ALL
      ? 'reloadImagesInPresentation'
      : 'reloadImagesInCurrentSlide';
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
    } catch (error) {
      console.log('error', error);
    } finally {
      loader.hide();
    }
  };

  const onScheduleDelete = async () => {
    loader.show();
    try {
      await run('deleteExistingTriggers');
      loader.hide();
    } catch (error) {
      console.log('error', error);
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
          <Vertical className={styles.tabContainer}>
            <Typography variant="p" className={styles.title} noMargin>
              {t.UPDATE_VIZ}
            </Typography>
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
