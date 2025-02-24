import { Icon } from 'widgets/lib/icon';
import './header.scss';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import _ from 'lodash';

export const Header = ({ hasBackButton = false, onBack = _.noop }) => {
  const { t } = useTranslations();
  return (
    <div className="header">
      <Icon name="TS-logo-black-no-bg" size="s" iconClassName="icon"></Icon>
      {hasBackButton && (
        <Button
          className="back"
          type="ICON"
          text={t.BACK_BUTTON}
          onClick={onBack}
        ></Button>
      )}
    </div>
  );
};
