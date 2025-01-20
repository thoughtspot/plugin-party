import { Icon } from 'widgets/lib/icon';
import { useRouter, route } from 'preact-router';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import styles from './header.module.scss';
import { Routes } from '../../routes';

export const Header = ({ history }) => {
  const { t } = useTranslations();
  const [router] = useRouter();
  const onBack = () => {
    history.back();
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
      {router.url !== Routes.HOME && (
        <Button
          className={styles.back}
          type="ICON"
          text={t.BACK_BUTTON}
          onClick={onBack}
        ></Button>
      )}
    </div>
  );
};
