import React from 'preact/compat';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import { useAppContext } from '../../app.context';
import styles from './summary-page.module.scss';

export const SummaryPage = ({ hostUrl, worksheetId, deploymentUrl }) => {
  const { stackBlitzUrl } = useAppContext();
  const { t } = useTranslations();

  const closeVercelModal = async () => {
    window.location.href =
      new URLSearchParams(window.location.search.split('?')[1]).get(
        'closeVercel'
      ) || '';
  };

  return (
    <div className={styles.containerStyle}>
      <p>
        Congratulations! You can now embed analytics in your Vercel application
        using ThoughtSpot Embedding capabilities. You can now:
      </p>
      <p>
        Embed Analytics in your app with this{' '}
        <a href={stackBlitzUrl} className={styles.codeStyle} target="_blank">
          code
        </a>
      </p>
      <p>
        Create data visualizations in your{' '}
        <a href={hostUrl} style={styles.codeStyle} target="_blank">
          ThoughtSpot cluster
        </a>
        .
      </p>
      <p>
        Securely authenticate your users with your Trusted Authentication
        service.
      </p>
      <Button onClick={closeVercelModal} text={t.FINISH_SETUP} />
    </div>
  );
};
