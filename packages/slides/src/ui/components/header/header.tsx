import { Button } from 'widgets/lib/button';
import { Icon } from 'widgets/lib/icon';
import { useRouter, route } from 'preact-router';
import styles from './header.module.scss';
import { Routes } from '../../routes';

export const Header = () => {
  const [router] = useRouter();
  const onBack = () => {
    window.history.back();
    console.log(router);
  };

  const onTSLogoClick = () => {
    route(Routes.HOME);
  };

  return (
    <div className={styles.header}>
      <Icon name="TS-logo-black-no-bg" size="m" onClick={onTSLogoClick}></Icon>
      {router.path !== Routes.HOME && (
        <Button type="ICON" onClick={onBack}>
          <Icon name="rd-icon-arrow-left" size="xs"></Icon>
        </Button>
      )}
    </div>
  );
};
