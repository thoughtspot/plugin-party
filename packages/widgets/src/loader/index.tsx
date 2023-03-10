import topbar from 'topbar';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

topbar.config({
  barThickness: 5,
});

const origFetch = window.fetch;
window.fetch = (...args) => {
  topbar.show();
  return origFetch(...args).then(
    (resp) => {
      topbar.hide();
      return resp;
    },
    (err) => {
      topbar.hide();
      return err;
    }
  );
};

export const LoaderContext = createContext({
  show: () => topbar.show(),
  hide: () => topbar.hide(),
});

export const useLoader = () => useContext(LoaderContext);
