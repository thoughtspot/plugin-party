import { useTranslations } from 'i18n';
import { ClusterUrl } from 'ts-init/src/cluster-url/cluster-url';
import { TSAuthInit } from 'ts-init/src/ts-auth-init/ts-auth-init';

export function VercelTSInit({ children, setClusterUrl, clusterUrl }) {
  const { t } = useTranslations();
  const onShowSetUrl = () => {
    setClusterUrl({
      ...clusterUrl,
      isCandidate: true,
    });
  };
  const onSetUrl = (url: string) => {
    setClusterUrl({
      url,
      isCandidate: false,
    });
  };

  if (clusterUrl.isCandidate)
    return (
      <ClusterUrl
        candidateUrl={clusterUrl.url}
        onSetUrl={onSetUrl}
        suggestedUrl={clusterUrl.suggestedUrl}
      />
    );

  return (
    <TSAuthInit onBack={onShowSetUrl} clusterUrl={clusterUrl.url}>
      {children}
    </TSAuthInit>
  );
}
