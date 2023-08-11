import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import { Card } from 'widgets/lib/card';
import { useShellContext } from 'gsuite-shell';
import { getSessionInfo } from '@thoughtspot/visual-embed-sdk';
import { getPath, Routes } from '../../routes';
import styles from './home.module.scss';
import { getToken } from '../../services/api';
import { useAppContext } from '../app.context';

export const Home = () => {
  const loader = useLoader();
  const { run } = useShellContext();
  const { t } = useTranslations();
  const { setUserID, userID } = useAppContext();

  useEffect(() => {
    const getUserInfo = async () => {
      const userInfo = await getSessionInfo();
      setUserID(userInfo?.userGUID);
    };
    getUserInfo();
  }, []);

  useEffect(() => {
    getToken().then((token) => {
      run('setToken', token.token, token.ttl);
    });
    loader.hide();
  }, []);

  return (
    <Vertical className={styles.home} spacing="c">
      <Card
        id={0}
        title={t.INSERT_TS_VIZ}
        subTitle={t.INSERT_TS_VIZ_DESCRIPTION}
        firstButton={t.BROWSE_TS}
        firstButtonType={'PRIMARY'}
        onFirstButtonClick={() => route(Routes.LIVEBOARDLIST)}
        isFirstButtonDisabled={userID === ''}
      />
      <Card
        id={1}
        title={t.UPDATE_VIZ}
        subTitle={t.UPDATE_VIZ_DESCRIPTION}
        firstButton={t.UPDATE_ALL_VIZ}
        firstButtonType="SECONDARY"
        onFirstButtonClick={() => {
          loader.show();
          run('reloadImagesInPresentation').then(() => loader.hide());
        }}
        secondButton={t.UPDATE_VIZ_IN_SLIDE}
        secondButtonType={'SECONDARY'}
        onSecondButtonClick={() => {
          loader.show();
          run('reloadImagesInCurrentSlide').then(() => loader.hide());
        }}
      />
    </Vertical>
  );
};
