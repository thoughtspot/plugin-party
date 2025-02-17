import {
  LiveboardEmbed,
  Action,
  EmbedEvent,
  HostEvent,
} from '@thoughtspot/visual-embed-sdk';
import { useShellContext } from 'gsuite-shell';
import { createContext } from 'preact';
import { useRouter } from 'preact-router';
import {
  useEffect,
  useContext,
  useRef,
  useState,
  useCallback,
} from 'preact/hooks';
import { useLoader } from 'widgets/lib/loader';
import { Dropdown } from 'widgets/lib/dropdown';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { useTranslations } from 'i18n';
import { ErrorBanner } from 'widgets/lib/error-banner';
import { SuccessBanner } from 'widgets/lib/success-banner';
import styles from './liveboard.module.scss';
import { getOffset, getTSLBVizLink } from '../../utils';
import { getLBTabs, getPersonalisedViews } from '../../services/api';
import { useAppContext } from '../app.context';
import { addImageQueued } from '../../../utils/ppt-code';
import { runPluginFn } from '../../../utils/plugin-utils';

const prerenderdLiveboardContext = createContext<any>({});

export const Liveboard = () => {
  const [router] = useRouter();
  const { show: showLoader, hide: hideLoader } = useLoader();
  const { t } = useTranslations();
  const { isPersonalisedViewSupported, isPowerpoint } = useAppContext();
  const liveboardId = router?.matches?.id;
  const loader = useLoader();
  const { run } = useShellContext();
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });
  const [success, setSuccess] = useState(false);

  const [personalisedViews, setPersonalisedViews] = useState([
    { title: 'Default View', id: '' },
  ]);
  const [selectedPersonalisedView, setSelectedPersonalisedView] = useState<{
    title: string;
    id: string;
  }>({ title: 'Default View', id: '' });
  const [tabs, setTabs] = useState([]);
  const [selectedTabs, setSelectedTabs] = useState<{
    title: string;
    id: string;
  }>();
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
  }, [errorMessage.visible, success, personalisedViews, tabs]);

  const onPersonalisedViewChange = (selectedView) => {
    setSelectedPersonalisedView(selectedView);
    if (lbRef.current) {
      if (selectedView.id === '') {
        lbRef.current.trigger(HostEvent.ResetLiveboardPersonalisedView);
        return;
      }
      lbRef.current.trigger(HostEvent.UpdatePersonalisedView, {
        viewId: selectedView.id,
      });
    }
  };

  const onTabsChange = (selectedTab) => {
    setSelectedTabs(selectedTab);
    if (lbRef.current) {
      let path = `embed/viz/${liveboardId}/tab/${selectedTab.id}`;
      if (selectedPersonalisedView?.id) {
        path += `?view=${selectedPersonalisedView.id}`;
      }
      lbRef.current?.trigger(HostEvent.Navigate, {
        path,
      });
    }
  };

  useEffect(() => {
    if (!liveboardId) return;

    const fetchData = async () => {
      try {
        const [views, tabsData] = await Promise.all([
          getPersonalisedViews(liveboardId),
          getLBTabs(liveboardId),
        ]);
        const viewsData = views.map((view) => ({
          title: view.name,
          id: view.id,
        }));
        setPersonalisedViews((prevData) => [...prevData, ...viewsData]);
        setTabs(tabsData);
        if (tabsData.length > 0) {
          setSelectedTabs(tabsData[0]);
          onTabsChange(tabsData[0]);
        }
      } catch (err) {
        console.error('Error fetching views and tabs:', err);
      } finally {
        setIsVisible(true);
        hideLoader();
      }
    };
    fetchData();
  }, [liveboardId]);

  const insertIntoSlide = useCallback(
    (e) => {
      const link = getTSLBVizLink(
        e.data.pinboardId,
        e.data.vizId,
        selectedPersonalisedView
      );
      loader.show();
      setErrorMessage({ ...errorMessage, visible: false });
      setSuccess(false);
      runPluginFn(isPowerpoint, run, addImageQueued, 'addImage', link)
        .then((res) => {
          loader.hide();
          if (res === 200) {
            setSuccess(true);
          } else if (res === 401) {
            setErrorMessage({
              message: t.SESSION_EXPIRED_MESSAGE,
              visible: true,
            });
          } else {
            setErrorMessage({
              message: t.INSERT_FAILURE_MESSAGE,
              visible: true,
            });
          }
        })
        .catch((error) => {
          loader.hide();
        });
    },
    [selectedPersonalisedView]
  );

  useEffect(() => {
    if (!lbRef.current) {
      return;
    }
    lbRef.current.on(Action.InsertInToSlide, insertIntoSlide);
    // eslint-disable-next-line consistent-return
    return () => {
      if (lbRef.current) {
        lbRef.current.off(Action.InsertInToSlide, insertIntoSlide);
      }
    };
  }, [selectedPersonalisedView]);

  useEffect(() => {
    if (lbRef.current && isPersonalisedViewSupported) {
      lbRef.current.trigger(HostEvent.ResetLiveboardPersonalisedView);
    }
  }, [lbRef.current]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    showLoader();
    const makeLiveboardVisible = () => {
      setIsVisible(true);
      hideLoader();
    };
    const lbEmbed = lbRef.current;
    // We will subscribe to Insert into slide embed event
    // If we are going to a different liveboard,
    // we need to wait for the new liveboard to render
    if (liveboardId !== prevLiveboardId) {
      lbEmbed.on(EmbedEvent.LiveboardRendered, makeLiveboardVisible);
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
      <SuccessBanner
        successMessage={t.IMAGE_INSERT_SUCCESS_MESSAGE}
        showBanner={success}
        onCloseIconClick={() => setSuccess(false)}
        className={styles.succesBanner}
      />
      <ErrorBanner
        errorMessage={errorMessage.message}
        showBanner={errorMessage.visible}
        onCloseIconClick={() =>
          setErrorMessage({ ...errorMessage, visible: false })
        }
        className={styles.errorBanner}
      />
      <Vertical className={styles.dropdownContainer}>
        {tabs.length > 0 && (
          <Dropdown
            options={tabs}
            placeholder={selectedTabs?.title}
            onChange={onTabsChange}
            title={t.TABS}
          />
        )}
        {personalisedViews.length > 1 && isPersonalisedViewSupported && (
          <Dropdown
            options={personalisedViews}
            placeholder={selectedPersonalisedView?.title}
            onChange={onPersonalisedViewChange}
            title={t.VIEWS}
          />
        )}
      </Vertical>
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
              '.pinboard-tab-module__tabNameEditor': {
                // Adding this to make carousel work properly, in scaligent
                // this value is set to 16.1428571429rem
                // As total width in plugin is approx 2x of above max width
                // carousel may hit corner case, lastVisible item is treated as not visible by IntersectionObserver
                // when interaction is just below threshold and item before that is considered as lastVisible.
                'max-width': '9.6857rem !important',
              },
              '.authenticated-app-view-module__blink': {
                // in React v2 shell, embed.container is wrapping test-container
                // twice, so we need to set height to 100% for both containers
                // will investigate that as well to see if we can avoid dual wrapping
                width: '100%',
                height: '100%',
              },
              '.embed-module__tsEmbedContainer': {
                width: '100%',
                height: '100%',
              },
              '.pinboard-header-module__tabAndFilterWrapperEmbed': {
                display: 'none !important',
              },
              '.pinboard-header-module__embedPinboardHeader': {
                display: 'none !important',
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
    lbRef.current?.trigger(HostEvent.Navigate, {
      path: `embed/viz/${liveboardId}?view=xyz`,
    });
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
