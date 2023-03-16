import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { useLoader } from 'widgets/lib/loader';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import { Colors, Typography } from 'widgets/lib/typography';
import { Card } from 'widgets/lib/card';
import { useShellContext } from 'gsuite-shell';
import { getPath, Routes } from '../../routes';
import './home.scss';
import { getToken } from '../../services/api';

export const Home = () => {
  const loader = useLoader();
  const { run } = useShellContext();
  const { t } = useTranslations();

  useEffect(() => {
    getToken().then((token) => {
      run('setToken', token.token, token.ttl);
    });
    loader.hide();
  }, []);
  return (
    <Vertical className="home" spacing="c">
      <Card
        id={0}
        title={t.INSERT_TS_VIZ}
        subTitle={t.INSERT_TS_VIZ_DESCRIPTION}
        firstButton={t.BROWSE_TS}
        firstButtonType={'PRIMARY'}
        onFirstButtonClick={() => route(Routes.LIST)}
        secondButton="A"
        secondButtonType="SECONDARY"
        onSecondButtonClick={() =>
          route(
            getPath(Routes.ANSWER, {
              id: '0fb54198-868d-45de-8929-139b0089e964',
            })
          )
        }
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
