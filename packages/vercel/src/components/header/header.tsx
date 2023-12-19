import { Colors, Typography } from 'widgets/lib/typography';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Icon } from 'widgets/lib/icon';
import Menu from 'widgets/lib/menu';
import { RiDiscordLine } from '@react-icons/all-files/ri/RiDiscordLine';
import { FiGithub } from '@react-icons/all-files/fi/FiGithub';
import React from 'react';
import styles from './header.module.scss';

export interface HeaderProps {
  headerLogoPath?: string;
  headerTitle: string;
}

const headerLinks = [
  {
    name: 'Docs',
    link: 'https://developers.thoughtspot.com/docs/',
    external: true,
  },
  {
    name: 'Support',
    link: 'https://www.thoughtspot.com/support',
    external: true,
  },
  {
    name: 'GitHub',
    link: 'https://github.com/thoughtspot/visual-embed-sdk',
    external: true,
    icon: FiGithub,
  },
  {
    name: 'Discord',
    link: 'https://discord.gg/JHPGwCkvjQ',
    external: true,
    icon: RiDiscordLine,
  },
];

export const Header = ({ headerLogoPath, headerTitle }: HeaderProps) => {
  return (
    <Vertical className={styles.header}>
      <Horizontal className={styles.headerInfo} spacing="d">
        <Horizontal className={styles.icon}>
          {headerLogoPath && <Icon name={headerLogoPath} size="l" />}
        </Horizontal>
        <Typography
          variant="h4"
          color={Colors.white}
          className={styles.headerTitle}
        >
          {headerTitle}
        </Typography>
        <Horizontal className={styles.menu}>
          <Menu config={headerLinks} />
        </Horizontal>
      </Horizontal>
    </Vertical>
  );
};
