import { useEffect, useState } from 'preact/hooks';
import { useShellContext } from 'gsuite-shell';
import { useLoader } from 'widgets/lib/loader';
import { Card } from 'widgets/lib/card';
import { useTranslations } from 'i18n';
import {
  getClusterUrl,
  setClusterUrlInPowerpoint,
} from 'slides/src/utils/ppt-code';
import { ClusterUrl } from './cluster-url/cluster-url';
import { TSAuthInit } from './ts-auth-init/ts-auth-init';
import { getConfig } from './services/config';

const useClusterUrl = (isPowerpoint = false) => {
  const [clusterUrl, setClusterUrl] = useState<any>();
  const { run } = useShellContext();
  const loader = useLoader();
  useEffect(() => {
    loader.show();
    if (!isPowerpoint) {
      run('getClusterUrl').then((url: any) => {
        setClusterUrl(url);
      });
    } else {
      const clusterDetails = getClusterUrl();
      setClusterUrl(clusterDetails);
    }
    loader.hide();
  }, [run, loader]);
  return [clusterUrl, setClusterUrl];
};

const isNotChrome = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return !userAgent.includes('chrome') && !userAgent.includes('crios');
};

export function TSInit({ children, isPowerpoint = false }) {
  const { t } = useTranslations();
  const [clusterUrl, setClusterUrl] = useClusterUrl(isPowerpoint);
  const { run } = useShellContext();
  if (isNotChrome() && !isPowerpoint) {
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
    if (!url || url.trim() === '') {
      setClusterUrl({
        url: '',
        isCandidate: true,
        isError: true,
      });
      return;
    }

    const formattedUrl = new URL(`https://${url.replace('https://', '')}`);
    const host = formattedUrl.host;
    await getConfig(host)
      .then(async (res) => {
        if (!isPowerpoint) run('setClusterUrl', host);
        else {
          await setClusterUrlInPowerpoint(host);
        }
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
          isCandidate: false,
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
