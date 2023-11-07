import { useRef } from 'preact/hooks';
import { Input } from 'widgets/lib/input';
import { Button } from 'widgets/lib/button';
import { Typography, Colors } from 'widgets/lib/typography';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import './cluster-url.scss';

export function ClusterUrl({ onSetUrl, candidateUrl, isUrlValid = true }) {
  const { t } = useTranslations();
  const inpRef = useRef<HTMLInputElement>(null);
  return (
    <Vertical hAlignContent="center">
      <img
        className="ts-logo"
        src="https://www.thoughtspot.com/images/logo-black-with-r.svg"
        id="ts-logo"
        width="160"
      ></img>
      <Vertical className="set-url-container" spacing="c" hAlignContent="start">
        <div>{t.THOUGHTSPOT_INSTANCE}</div>
        <Input
          initialValue={candidateUrl}
          ref={inpRef}
          className="ts-cluster-url"
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
        ></Button>
        <div
          className="free-trial-msg"
          dangerouslySetInnerHTML={{ __html: t.START_FREE_TRIAL }}
        ></div>
      </Vertical>
    </Vertical>
  );
}
