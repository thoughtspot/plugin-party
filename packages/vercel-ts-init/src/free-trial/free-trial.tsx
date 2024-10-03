import { useTranslations } from 'i18n';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { Card } from 'widgets/lib/card';
import { Icon } from 'widgets/lib/icon';
import { ClusterUrl } from 'ts-init/src/cluster-url/cluster-url';
import { Modal } from 'antd';
import './free-trial.scss';
import { useState } from 'preact/hooks';

export function FreeTrial({
  onSetUrl,
  candidateUrl,
  suggestedUrl = '',
  isUrlValid = true,
}) {
  const { t } = useTranslations();
  const TypographyAny: any = Typography;
  const [isModalVisible, setModalVisible] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);

  const onSignupButtonClick = () => {
    window.open('https://www.thoughtspot.com/trial?tsiref=vercel', '_blank');
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleOk = () => {
    setShowLoginPage(true);
    setModalVisible(false);
  };

  const handleLogin = () => {
    setShowLoginPage(true);
  };

  return (
    <>
      {!showLoginPage ? (
        <Vertical hAlignContent="center" className="free-trial">
          <Horizontal className="icon-wrapper">
            <Icon name="rd-icon-ts-logo-with-text"></Icon>
            <TypographyAny variant="h2" className="plus-sign">
              +
            </TypographyAny>
            <Icon name="rd-icon-vercel"></Icon>
          </Horizontal>
          <TypographyAny
            className="text"
            variant="p"
            htmlContent={t.FREE_TRIAL_DESCRIPTION}
          ></TypographyAny>
          <Horizontal className="card-wrapper">
            <Card
              id={0}
              className="first-card"
              title={t.FIRST_CARD_TITLE}
              titleClassName="title"
              subTitle={t.FIRST_CARD_DESCRIPTION}
              subtitleClassName="text"
              firstButtonType={'PRIMARY'}
              firstButton={t.SIGN_UP}
              onFirstButtonClick={onSignupButtonClick}
            ></Card>
            <Card
              id={1}
              className="second-card"
              title={t.SECOND_CARD_TITLE}
              titleClassName="title"
              subTitle={t.SECOND_CARD_DESCRIPTION}
              subtitleClassName="text"
              firstButtonType={'SECONDARY'}
              firstButton={t.LOGIN}
              onFirstButtonClick={handleLogin}
            ></Card>
          </Horizontal>
        </Vertical>
      ) : (
        <ClusterUrl
          candidateUrl={candidateUrl}
          onSetUrl={onSetUrl}
          suggestedUrl={suggestedUrl}
          isUrlValid={isUrlValid}
          isVercelEnabled={true}
        ></ClusterUrl>
      )}
      <Modal
        title={t.RESUME_SETUP}
        open={isModalVisible}
        okText={t.RESUME}
        onOk={handleOk}
        closeIcon={false}
        centered={true}
        onCancel={handleCancel}
      >
        <TypographyAny variant="p">{t.MODAL_DESCRIPTION}</TypographyAny>
      </Modal>
    </>
  );
}
