import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import { Button } from 'widgets/lib/button';
import { useShellContext } from 'gsuite-shell';
import './home.scss';
import React from 'react';

export const Home = () => {
  const loader = useLoader();
  const { run } = useShellContext();
  const { t } = useTranslations();

  return (
    <Vertical className="home">
      <Button
        onClick={() => console.log('Clicks clicked')}
        text={t.BROWSE_TS}
        type={'PRIMARY'}
      ></Button>
    </Vertical>
  );
};
