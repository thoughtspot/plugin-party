import React from 'preact';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import { useEffect, useState } from 'preact/hooks';
import { Card } from 'widgets/lib/card';
import { route } from 'preact-router';
import { useTranslations } from 'i18n';
import { useLoader } from 'widgets/lib/loader';
import { useShellContext } from 'gsuite-shell';
import styles from './home.module.scss';
import { Routes } from '../../routes';
import { getToken } from '../../services/api';

export const Home = () => {
  const { t } = useTranslations();
  const loader = useLoader();
  const { run } = useShellContext();
  useEffect(() => {
    getToken().then((token) => {
      run('setToken', token.token, token.ttl);
    });
    loader.hide();
  }, []);
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
    type: BannerType.MESSAGE,
  });
  const [selectedRefresh, setSelectedRefresh] = useState(t.REFRESH_ALL_SHEETS);
  const handleSelectionChange = (value: string) => {
    setSelectedRefresh(value);
  };
  const handleRefreshData = async () => {
    try {
      loader.show();

      if (selectedRefresh === t.REFRESH_ALL_SHEETS) {
        await run('refreshAllSheets');
      } else {
        await run('refreshData');
      }
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      loader.hide();
    }
  };

  return (
    <Vertical className={styles.home}>
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
      {!errorMessage.visible && !errorMessage.message && (
        <>
          <Card
            id={0}
            title={t.INSERT_TS_DATA}
            subTitle={t.INSERT_TS_DATA_DESCRIPTION}
            firstButton={t.SELECT_TS_DATA}
            firstButtonType={'PRIMARY'}
            onFirstButtonClick={() => route(Routes.SEARCHBAR)}
          />
          <Card
            id={1}
            title={t.REFRESH_TS_DATA}
            subTitle={t.REFRESH_TS_DATA_DESCRIPTION}
            firstRadioButtonText={t.REFRESH_ALL_SHEETS}
            secondRadioButtonText={t.REFRESH_CURRENT_SHEET}
            onRadioSelectionChange={handleSelectionChange}
            defaultRadioSelected={t.REFRESH_ALL_SHEETS}
            firstButton={t.REFRESH_DATA}
            firstButtonType={'SECONDARY'}
            onFirstButtonClick={handleRefreshData}
          />
        </>
      )}
    </Vertical>
  );
};
