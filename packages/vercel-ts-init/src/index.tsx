import { Card } from 'widgets/lib/card';
import { useTranslations } from 'i18n';
import { ClusterUrl } from 'ts-init/src/cluster-url/cluster-url';
import { TSAuthInit } from 'ts-init/src/ts-auth-init/ts-auth-init';

const isNotChrome = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return !userAgent.includes('chrome') && !userAgent.includes('crios');
};

export function VercelTSInit({ children, setClusterUrl, clusterUrl }) {
  const { t } = useTranslations();
  if (isNotChrome()) {
    return (
      <Card
        id={0}
        title={t.BROSWER_NOT_SUPPORTED}
        subTitle={t.BROSER_RECCOMENDATION}
      />
    );
  }
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
    return <ClusterUrl candidateUrl={clusterUrl.url} onSetUrl={onSetUrl} />;

  return (
    <TSAuthInit onBack={onShowSetUrl} clusterUrl={clusterUrl.url}>
      {children}
    </TSAuthInit>
  );
}
