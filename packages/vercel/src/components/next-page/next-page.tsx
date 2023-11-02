import React from 'react';
import { useTranslations } from 'i18n';
import styles from './next-page.module.scss';

export const NextPage = () => {
  const { t } = useTranslations();
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.heading}>{t.TRUSTED_AUTH_HEADING}</div>
        <div className={styles.divider}></div>
        <div className={styles.heading}>{t.TRUSTED_AUTH_TEMPLATE_HEADING}</div>
        <p dangerouslySetInnerHTML={{ __html: t.TRUSTED_AUTH_DESCRIPTION }}></p>
        <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthoughtspot%2Ftoken-auth-service&repository-name=my-awesome-project&redirect-url=https%3A%2F%2Flocalhost%3A3000&output-directory=.">
          <img src="https://vercel.com/button" alt="Deploy with Vercel" />
        </a>
      </div>
    </div>
  );
};
