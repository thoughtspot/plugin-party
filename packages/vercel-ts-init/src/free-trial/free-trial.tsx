import { useTranslations } from 'i18n';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { Card } from 'widgets/lib/card';
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
    window.open('https://www.thoughtspot.com/trial', '_blank');
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
          <img
            className="ts-logo"
            src="https://www.thoughtspot.com/images/logo-black-with-r.svg"
            id="ts-logo"
            width="160"
          ></img>
          <TypographyAny
            className="text"
            variant="p"
            htmlContent={t.FREE_TRIAL_DESCRIPTION}
          ></TypographyAny>
          <Horizontal spacing="h" className="horizontalWrapper">
            <Card
              id={0}
              className="card"
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
              className="card"
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
