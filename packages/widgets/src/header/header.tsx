import { Colors, Typography } from '../typography';
import { Horizontal, Vertical } from '../layout/flex-layout';
import styles from './header.module.scss';
import { Icon } from '../icon';

export interface HeaderProps {
  headerLogoPath?: string;
  headerTitle: string;
}

export const Header = ({ headerLogoPath, headerTitle }: HeaderProps) => {
  return (
    <Vertical className={styles.header}>
      <Horizontal className={styles.headerInfo}>
        {headerLogoPath && <Icon name={headerLogoPath} size="xl" />}
        <Typography
          variant="h4"
          color={Colors.white}
          className={styles.headerTitle}
        >
          {headerTitle}
        </Typography>
      </Horizontal>
    </Vertical>
  );
};
