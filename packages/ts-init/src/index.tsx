import { useEffect, useState } from 'preact/hooks';
import { useShellContext } from 'gsuite-shell';
import { useLoader } from 'widgets/lib/loader';
import { Card } from 'widgets/lib/card';
import { useTranslations } from 'i18n';
import { ClusterUrl } from './cluster-url/cluster-url';
import { TSAuthInit } from './ts-auth-init/ts-auth-init';
import { getConfig } from './services/config';

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
      isError: false,
    });
  };
  const onSetUrl = async (url: string) => {
    const formattedUrl = new URL(`https://${url.replace('https://', '')}`);
    const host = formattedUrl.host;
    await getConfig(host)
      .then((res) => {
        run('setClusterUrl', host);
        setClusterUrl({
          url: host,
          isCandidate: false,
          isError: false,
          isSamlEnabled: res?.samlEnabled || res?.oktaEnabled,
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
  if (!clusterUrl) {
    return <></>;
  }

  if (clusterUrl.isCandidate) {
    return (
      <ClusterUrl
        candidateUrl={clusterUrl.url}
        onSetUrl={onSetUrl}
        isUrlValid={!clusterUrl.isError}
      />
    );
  }

  return (
    <TSAuthInit
      onBack={onShowSetUrl}
      clusterUrl={clusterUrl.url}
      isSamlEnabled={clusterUrl.isSamlEnabled}
    >
      {children}
    </TSAuthInit>
  );
}
