import { Icon } from 'widgets/lib/icon';
import { useRouter, route } from 'preact-router';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import { logout } from '@thoughtspot/visual-embed-sdk';
import styles from './header.module.scss';
import { Routes } from '../../routes';

export const Header = ({ history, isPowerpoint }) => {
  const { t } = useTranslations();
  const [router] = useRouter();
  const onBack = () => {
    history.back();
  };

  const onLogout = async () => {
    await logout();
    window.location.reload();
  };

  const onTSLogoClick = () => {
    route(Routes.HOME);
  };

  return (
    <div className={styles.header}>
      <Icon
        name="TS-logo-black-no-bg"
        size="s"
        onClick={onTSLogoClick}
        iconClassName={styles.icon}
      ></Icon>
      {router.url !== Routes.HOME &&
        router.url !== Routes.POWERPOINT &&
        router.url !== Routes.POWERPOINT_PRODUCTION && (
          <Button
            className="back"
            type="ICON"
            text={t.BACK_BUTTON}
            onClick={onBack}
          ></Button>
        )}
      {isPowerpoint &&
        (router.url === Routes.HOME ||
          router.url === Routes.POWERPOINT ||
          router.url === Routes.POWERPOINT_PRODUCTION) && (
          <Button
            className="back"
            type="ICON"
            text={t.LOGOUT}
            onClick={onLogout}
          ></Button>
        )}
    </div>
  );
};
