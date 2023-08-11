import { useEffect, useState } from 'preact/hooks';
import { useShellContext } from 'gsuite-shell';
import { useLoader } from 'widgets/lib/loader';
import { Card } from 'widgets/lib/card';
import { useTranslations } from 'i18n';
import { ClusterUrl } from './cluster-url/cluster-url';
import { TSAuthInit } from './ts-auth-init/ts-auth-init';

const useClusterUrl = () => {
  const [clusterUrl, setClusterUrl] = useState<any>();
  const { run } = useShellContext();
  const loader = useLoader();
  useEffect(() => {
    loader.show();
    run('getClusterUrl').then((url: any) => {
      setClusterUrl(url);
      loader.hide();
    });
  }, [run, loader]);
  return [clusterUrl, setClusterUrl];
};

const isNotChrome = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return !userAgent.includes('chrome') && !userAgent.includes('crios');
};

export function TSInit({ children }) {
  const { t } = useTranslations();
  const [clusterUrl, setClusterUrl] = useClusterUrl();
  const { run } = useShellContext();
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
    run('setClusterUrl', url);
    setClusterUrl({
      url,
      isCandidate: false,
    });
  };
  if (!clusterUrl) {
    return <></>;
  }

  if (clusterUrl.isCandidate) {
    return <ClusterUrl candidateUrl={clusterUrl.url} onSetUrl={onSetUrl} />;
  }

  return (
    <TSAuthInit onBack={onShowSetUrl} clusterUrl={clusterUrl.url}>
      {children}
    </TSAuthInit>
  );
}
