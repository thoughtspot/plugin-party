import {
  init,
  AuthType,
  AuthStatus,
  AuthEvent,
  LogLevel,
} from '@thoughtspot/visual-embed-sdk';
import { FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useLoader } from 'widgets/lib/loader';
import { Login } from '../login/login';

const initTSSAML = (url: string) => {
  return init({
    thoughtSpotHost: url,
    authType: AuthType.SAMLRedirect,
    inPopup: true,
    logLevel: LogLevel.DEBUG,
  });
};

const initTSBasic = (url: string, username: string, password: string) => {
  return init({
    thoughtSpotHost: url,
    authType: AuthType.Basic,
    username,
    password,
    detectCookieAccessSlow: true,
    logLevel: LogLevel.DEBUG,
  });
};

interface TSAuthInitProps {
  clusterUrl: string;
  onBack: () => void;
  isSamlEnabled?: boolean;
}

enum AuthState {
  PENDING,
  SUCCESS,
  FAILED,
  UNDEFINED,
}

export const TSAuthInit: FunctionComponent<TSAuthInitProps> = ({
  clusterUrl,
  children,
  onBack,
  isSamlEnabled,
}) => {
  const [authState, setAuthState] = useState(AuthState.UNDEFINED);
  const [authEE, setAuthEE] = useState<any>();
  const [showCredError, setShowCredError] = useState(false);
  const loader = useLoader();
  useEffect(() => {
    const _authEE = initTSSAML(clusterUrl);

    _authEE.once(AuthStatus.WAITING_FOR_POPUP, () => {
      setAuthState(AuthState.PENDING);
    });
    setAuthEE(_authEE);
  }, [clusterUrl]);

  useEffect(() => {
    authEE?.once(AuthStatus.SDK_SUCCESS, () => {
      setAuthState(AuthState.SUCCESS);
    });
    authEE?.once(AuthStatus.FAILURE, () => {
      setAuthState(AuthState.FAILED);
      setShowCredError(true);
    });
  }, [authEE]);

  const onTriggerSSO = () => {
    authEE?.emit(AuthEvent.TRIGGER_SSO_POPUP);
  };

  const onCredSubmit = (username: string, password: string) => {
    setShowCredError(false);
    const _authEE = initTSBasic(clusterUrl, username, password);
    setAuthEE(_authEE);
  };

  if (authState === AuthState.SUCCESS) {
    loader.show();
    return <>{children}</>;
  }

  if (authState === AuthState.UNDEFINED) {
    return <></>;
  }

  return (
    <Login
      onBack={onBack}
      onSSO={onTriggerSSO}
      onCredSubmit={onCredSubmit}
      isCredFailed={showCredError}
      setShowCredError={setShowCredError}
      isSamlEnabled={isSamlEnabled}
    />
  );
};
