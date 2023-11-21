import React from 'preact/compat';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import { useAppContext } from '../../app.context';

export const SummaryPage = ({ hostUrl, worksheetId, deploymentUrl }) => {
  const { stackBlitzUrl } = useAppContext();
  const { t } = useTranslations();

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '600px',
    margin: 'auto',
  };

  const codeStyle = {
    color: '#007BFF', // Set the color you prefer
    textDecoration: 'underline',
    cursor: 'pointer',
  };

  const closeVercelModal = async () => {
    window.location.href =
      new URLSearchParams(window.location.search.split('?')[1]).get(
        'closeVercel'
      ) || '';
  };

  return (
    <div style={containerStyle}>
      <p>
        Congratulations! You can now embed analytics in your Vercel application
        using ThoughtSpot Embedding capabilities. You can now:
      </p>
      <p>
        Embed Analytics in your app with this{' '}
        <a href={stackBlitzUrl} style={codeStyle} target="_blank">
          code
        </a>
      </p>
      <p>
        Create data visualizations in your{' '}
        <a href={hostUrl} style={codeStyle} target="_blank">
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
