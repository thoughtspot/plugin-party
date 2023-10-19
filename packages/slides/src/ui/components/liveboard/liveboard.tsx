import {
  LiveboardEmbed,
  Action,
  EmbedEvent,
} from '@thoughtspot/visual-embed-sdk';
import { useShellContext } from 'gsuite-shell';
import { createContext } from 'preact';
import { useRouter } from 'preact-router';
import { useEffect, useContext, useRef, useState } from 'preact/hooks';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import { ErrorBanner } from 'widgets/lib/error-banner';
import styles from './liveboard.module.scss';
import { getOffset, getTSLBVizLink } from '../../utils';

const prerenderdLiveboardContext = createContext<any>({});

export const Liveboard = () => {
  const [router] = useRouter();
  const { show: showLoader, hide: hideLoader } = useLoader();
  const { t } = useTranslations();
  const liveboardId = router?.matches?.id;
  const loader = useLoader();
  const { run } = useShellContext();
  const [showError, setShowError] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const {
    setIsVisible,
    setLiveboardId,
    setCoords,
    lbRef,
    liveboardId: prevLiveboardId,
  } = useContext(prerenderdLiveboardContext);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    setLiveboardId(liveboardId);
    const coords = ref.current.getBoundingClientRect();
    const offset = getOffset(ref.current);
    setCoords({
      height: coords.height,
      width: coords.width,
      top: offset.top,
      left: offset.left,
    });
  }, [showError]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    showLoader();
    const makeLiveboardVisible = () => {
      setIsVisible(true);
      hideLoader();
    };
    const insertIntoSlide = (e) => {
      const link = getTSLBVizLink(e.data.pinboardId, e.data.vizId);
      loader.show();
      setShowError(false);
      run('addImage', link)
        .then(() => {
          loader.hide();
        })
        .catch((error) => {
          loader.hide();
          setShowError(true);
        });
    };
    const lbEmbed = lbRef.current;
    // We will subscribe to Insert into slide embed event
    lbEmbed.on(Action.InsertInToSlide, insertIntoSlide);
    // If we are going to a different liveboard,
    // we need to wait for the new liveboard to render
    if (liveboardId !== prevLiveboardId) {
      lbEmbed.on(EmbedEvent.LiveboardRendered, makeLiveboardVisible);
    } else {
      makeLiveboardVisible();
    }
    // eslint-disable-next-line consistent-return
    return () => {
      setIsVisible(false);
      setCoords({
        height: 0,
        width: 0,
      });
      lbEmbed.off(EmbedEvent.LiveboardRendered, makeLiveboardVisible);
      lbEmbed.off(Action.InsertInToSlide, insertIntoSlide);
    };
  }, []);
  return (
    <Vertical className={styles.liveboardContainer}>
      <ErrorBanner
        errorMessage={t.INSERT_FAILURE_MESSAGE}
        showBanner={showError}
        onCloseIconClick={() => setShowError(false)}
      />
      <div className={styles.liveboardContainer} ref={ref}></div>
    </Vertical>
  );
};

const PrerenderedLiveboardShell = () => {
  const ref = useRef(null);
  const { isVisible, liveboardId, coords, lbRef } = useContext(
    prerenderdLiveboardContext
  );
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    lbRef.current = new LiveboardEmbed(ref.current, {
      visibleActions: [Action.InsertInToSlide],
      additionalFlags: {
        modularHomeExperience: false,
      },
      frameParams: {
        height: '100%',
      },
      isLiveboardHeaderSticky: false,
      insertInToSlide: true,
      customizations: {
        style: {
          customCSS: {
            rules_UNSTABLE: {
              body: {
                zoom: '0.6',
                height: '100% !important',
              },
              '.pinboard-header-module__pinboardHeader': {
                display: 'none !important',
              },
              '.ag-header': {
                'pointer-events': 'none !important',
              },
              '.answer-content-module__answerContent': {
                'pointer-events': 'none !important',
              },
            },
          },
        },
      },
    });
    lbRef.current.on(EmbedEvent.ALL, (e) => console.log(e));
    lbRef.current.prerenderGeneric();
  }, []);
  useEffect(() => {
    if (!liveboardId) {
      return;
    }
    lbRef.current?.navigateToLiveboard(liveboardId);
  }, [liveboardId]);
  return (
    <div
      id="prerender"
      style={{
        opacity: isVisible ? 1 : 0,
        ...coords,
        position: 'absolute',
      }}
      ref={ref}
    ></div>
  );
};

export const PrerenderdLiveboardProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [liveboardId, setLiveboardId] = useState();
  const [coords, setCoords] = useState({
    left: 0,
    top: 0,
    height: 0,
    width: 0,
  });
  const lbRef = useRef<LiveboardEmbed | null>(null);
  return (
    <prerenderdLiveboardContext.Provider
      value={{
        isVisible,
        setIsVisible,
        liveboardId,
        setLiveboardId,
        coords,
        setCoords,
        lbRef,
      }}
    >
      {children}
      <PrerenderedLiveboardShell />
    </prerenderdLiveboardContext.Provider>
  );
};
