import { AppEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import styles from '../connection/connection.module.scss';

export const FullEmbed = ({ embedPath, handleAllEmbedEvent }) => {
  const embedRef = useEmbedRef();

  const customization = {
    style: {
      customCSS: {
        rules_UNSTABLE: {
          '.wizard-module__buttonsContainer .button-module__secondary': {
            display: 'none',
          },
        },
      },
    },
  };

  return (
    <AppEmbed
      frameParams={{
        height: '100%',
        width: '100%',
      }}
      className={styles.container}
      ref={embedRef}
      path={embedPath}
      onALL={handleAllEmbedEvent}
      customizations={customization}
    ></AppEmbed>
  );
};
