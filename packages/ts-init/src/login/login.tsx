import { Vertical, Horizontal } from 'widgets/lib/layout/flex-layout';
import { Button } from 'widgets/lib/button';
import { Input } from 'widgets/lib/input';
import { Colors, Typography } from 'widgets/lib/typography';
import { useTranslations } from 'i18n';
import { useEffect, useRef, useState } from 'preact/hooks';
import './login.scss';
import { ErrorBanner } from 'widgets/lib/error-banner';
import { Header } from '../header/header';

export const Login = ({
  onBack,
  onSSO,
  onCredSubmit,
  isCredFailed,
  setShowCredError,
  isSamlEnabled,
}) => {
  const { t } = useTranslations();
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const onEnterPress = (e) => {
    if (e.code === 'Enter') {
      onCredSubmit(userRef.current?.value, passRef.current?.value);
    }
  };
  useEffect(() => {
    passRef?.current?.addEventListener('keydown', onEnterPress);
    return () => passRef?.current?.removeEventListener('keydown', onEnterPress);
  });
  useEffect(() => setShowCredError(isCredFailed), [isCredFailed]);
  const [showSamlError, setShowSamlError] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });
  useEffect(() => {
    setErrorMessage({
      visible: isCredFailed,
      message: t.INCORRECT_PASSWORD,
    });
  }, [isCredFailed]);
  return (
    <Vertical spacing="f">
      <Header hasBackButton={true} onBack={onBack} />
      <ErrorBanner
        errorMessage={errorMessage.message}
        showBanner={errorMessage.visible}
        onCloseIconClick={() =>
          setErrorMessage({ ...errorMessage, visible: false })
        }
      />
      <Vertical className="login-container" spacing="b">
        <Typography variant="p" className="login-title">
          {t.SIGN_INTO_TS}
        </Typography>
        <Vertical spacing="d">
          <Vertical spacing="c">
            <Input
              type="TEXT"
              placeholder="Username"
              className="input-container"
              id="username"
              onFocus={() => setShowCredError(false)}
              ref={userRef}
              hasError={isCredFailed}
              required
            />
            <Input
              type="PASSWORD"
              placeholder="Password"
              className="input-container"
              id="password"
              hasError={isCredFailed}
              onFocus={() => setShowCredError(false)}
              ref={passRef}
              required
            />
          </Vertical>
          <Button
            id="submit"
            type="PRIMARY"
            onClick={() =>
              onCredSubmit(userRef.current?.value, passRef.current?.value)
            }
            text={t.SIGN_IN}
          ></Button>
          <Button
            className="sso-button"
            type="SECONDARY"
            onClick={onSSO}
            text={t.SIGN_IN_SSO}
          ></Button>
        </Vertical>
      </Vertical>
    </Vertical>
  );
};
