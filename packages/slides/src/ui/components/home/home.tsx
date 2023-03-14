import { route } from 'preact-router';
import { useLoader } from 'widgets/lib/loader';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import { Colors, Typography } from 'widgets/lib/typography';
import { Card } from 'widgets/lib/card';
import { useShellContext } from 'gsuite-shell';
import { Routes } from '../../routes';
import './home.scss';

export const Home = () => {
  const loader = useLoader();
  const { run } = useShellContext();
  const { t } = useTranslations();

  return (
    <Vertical className="home" spacing="f">
      <Card
        id={0}
        title={t.INSERT_TS_VIZ}
        subTitle={t.INSERT_TS_VIZ_DESCRIPTION}
        firstButton={t.BROWSE_TS}
        firstButtonType={'PRIMARY'}
        onFirstButtonClick={() => route(Routes.LIST)}
      />
      <Card
        id={1}
        title={t.UPDATE_VIZ}
        subTitle={t.UPDATE_VIZ_DESCRIPTION}
        firstButton={t.UPDATE_ALL_VIZ}
        firstButtonType="SECONDARY"
        onFirstButtonClick={function (): void {
          throw new Error('Function not implemented.');
        }}
        secondButton={t.UPDATE_VIZ_IN_SLIDE}
        secondButtonType={'SECONDARY'}
      />
      <Card id={2} title={'Details'} subTitle={''}>
        <Typography variant={'p'}>
          -{'>'} details about focused element
        </Typography>
      </Card>
    </Vertical>
  );
};
