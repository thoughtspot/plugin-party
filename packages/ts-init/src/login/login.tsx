import { Vertical, Horizontal } from 'widgets/lib/layout/flex-layout';
import { Button } from 'widgets/lib/button';
import { Input } from 'widgets/lib/input';
import { Colors, Typography } from 'widgets/lib/typography';
import { useTranslations } from 'i18n';
import { useEffect, useRef, useState } from 'preact/hooks';
import './login.scss';

export const Login = ({
  onBack,
  onSSO,
  onCredSubmit,
  isCredFailed,
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
  const [showCredError, setShowCredError] = useState(isCredFailed);
  useEffect(() => setShowCredError(isCredFailed), [isCredFailed]);
  const [showSamlError, setShowSamlError] = useState(isSamlEnabled);
  return (
    <Vertical spacing="f" hAlignContent="center">
      <img
        className="ts-logo"
        src="https://www.thoughtspot.com/images/logo-black-with-r.svg"
        id="ts-logo"
        width="160"
      ></img>
      <Horizontal spacing="c">
        <Button type="SECONDARY" onClick={onBack} text="←"></Button>
        <Button
          type="PRIMARY"
          onClick={isSamlEnabled ? onSSO : () => setShowSamlError(true)}
          text={t.SIGN_IN_SSO}
        ></Button>
      </Horizontal>
      <div className="auth-separator">- {t.OR} -</div>
      <Vertical spacing="c">
        <Input
          type="TEXT"
          placeholder="Username"
          id="username"
          onFocus={() => setShowCredError(false)}
          ref={userRef}
          required
        />
        <Input
          type="PASSWORD"
          placeholder="Password"
          id="password"
          onFocus={() => setShowCredError(false)}
          ref={passRef}
          required
        />
        {showCredError && (
          <Typography variant="h6" color={Colors.failure}>
            {t.INCORRECT_PASSWORD}
          </Typography>
        )}
        {showSamlError && (
          <Typography variant="h6" color={Colors.failure}>
            {t.SSO_NOT_ENABLED_ERROR}
          </Typography>
        )}
        <Button
          id="submit"
          type="PRIMARY"
          onClick={() =>
            onCredSubmit(userRef.current?.value, passRef.current?.value)
          }
          text={t.SIGN_IN}
        ></Button>
      </Vertical>
    </Vertical>
  );
};
