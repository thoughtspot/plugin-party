import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { Button } from 'widgets/lib/button';
import { useShellContext } from 'gsuite-shell';
import './home.scss';
import React from 'react';

export const Home = () => {
  const loader = useLoader();
  const { run } = useShellContext();

  return (
    <Vertical className="home">
      <Button
        onClick={() => console.log('Clicks clicked')}
        text={'Browse Content'}
        type={'PRIMARY'}
      ></Button>
    </Vertical>
  );
};
