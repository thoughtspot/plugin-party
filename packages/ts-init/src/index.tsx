import { useEffect, useState } from 'preact/hooks';
import { useShellContext } from 'gsuite-shell';
import { useLoader } from 'widgets/lib/loader';
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

export function TSInit({ children }) {
  const [clusterUrl, setClusterUrl] = useClusterUrl();
  const { run } = useShellContext();
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
