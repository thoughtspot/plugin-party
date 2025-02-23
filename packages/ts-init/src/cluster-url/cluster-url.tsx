import { useRef } from 'preact/hooks';
import { Input } from 'widgets/lib/input';
import { Button } from 'widgets/lib/button';
import { Typography, Colors } from 'widgets/lib/typography';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import './cluster-url.scss';
import { Header } from '../header/header';

export function ClusterUrl({
  onSetUrl,
  candidateUrl,
  suggestedUrl = '',
  isUrlValid = true,
  isVercelEnabled = false,
}) {
  const { t } = useTranslations();
  const inpRef = useRef<HTMLInputElement>(null);
  return (
    <Vertical hAlignContent="center" spacing="f">
      <Header />
      <Vertical spacing="b" hAlignContent="start">
        <div className="title">{t.THOUGHTSPOT_INSTANCE}</div>
        {isVercelEnabled ? (
          <div
            className="ts-instance-msg"
            dangerouslySetInnerHTML={{
              __html: t.THOUGHTSPOT_INSTANCE_MSG,
            }}
          ></div>
        ) : (
          <></>
        )}
        <Input
          initialValue={candidateUrl}
          ref={inpRef}
          className="ts-cluster-url"
          placeholder={suggestedUrl}
          hasError={!isUrlValid}
        />
        {!isUrlValid && (
          <Typography
            variant="h6"
            color={Colors.failure}
            noMargin
            className="invalid-url-error"
          >
            {t.INVALID_INSTANCE_ERROR}
          </Typography>
        )}
        <Button
          onClick={() => onSetUrl(inpRef.current.value)}
          text={t.CONTINUE}
          className="continue-button"
        ></Button>
        {!isVercelEnabled ? (
          <div
            className="free-trial-msg"
            dangerouslySetInnerHTML={{ __html: t.START_FREE_TRIAL }}
          ></div>
        ) : (
          <div
            className="description"
            dangerouslySetInnerHTML={{
              __html: t.THOUGHTSPOT_INSTANCE_DESCRIPTION,
            }}
          ></div>
        )}
      </Vertical>
    </Vertical>
  );
}
