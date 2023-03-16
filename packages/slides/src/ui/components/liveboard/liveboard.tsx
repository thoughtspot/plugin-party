import {
  LiveboardEmbed,
  useEmbedRef,
} from '@thoughtspot/visual-embed-sdk/react';
import { Action, EmbedEvent } from '@thoughtspot/visual-embed-sdk';
import { useRouter } from 'preact-router';
import { useEffect } from 'react';

export const Liveboard = () => {
  const [router] = useRouter();
  const liveboardId = router?.matches?.id;
  const ref = useEmbedRef();
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ref.current.on('insertInToSlide', (e) => {
      console.log(e);
    });
  }, [ref.current]);
  return (
    <LiveboardEmbed
      ref={ref}
      liveboardId={liveboardId}
      fullHeight={true}
      insertInToSlide={true}
      visibleActions={[Action.InsertInToSlide]}
      customizations={{
        style: {
          customCSS: {
            rules_UNSTABLE: {
              body: {
                zoom: '0.6',
              },
            },
          },
        },
      }}
    />
  );
};
