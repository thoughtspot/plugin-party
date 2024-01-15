import { useTranslations } from 'i18n';
import { ClusterUrl } from 'ts-init/src/cluster-url/cluster-url';
import { TSAuthInit } from 'ts-init/src/ts-auth-init/ts-auth-init';
import { getConfig } from './services/config';
import { FreeTrial } from './free-trial/free-trial';

export function VercelTSInit({ children, setClusterUrl, clusterUrl }) {
  const { t } = useTranslations();
  const onShowSetUrl = () => {
    setClusterUrl({
      ...clusterUrl,
      isCandidate: true,
    });
  };

  const onSetUrl = async (url: string) => {
    const formattedUrl = new URL(`https://${url.replace('https://', '')}`);
    const host = formattedUrl.host;
    await getConfig(host)
      .then(() => {
        setClusterUrl({
          url: host,
          isCandidate: false,
          isError: false,
        });
      })
      .catch((err) => {
        setClusterUrl({
          url,
          isCandidate: true,
          isError: true,
        });
      });
  };

  if (clusterUrl.isCandidate)
    return (
      <FreeTrial
        candidateUrl={clusterUrl.url}
        onSetUrl={onSetUrl}
        isUrlValid={!clusterUrl.isError}
        suggestedUrl={clusterUrl.suggestedUrl}
      />
    );

  return (
    <TSAuthInit onBack={onShowSetUrl} clusterUrl={clusterUrl.url}>
      {children}
    </TSAuthInit>
  );
}
