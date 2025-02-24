import topbar from 'topbar';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { showLoaderOnFetch } from './loader-util';

topbar.config({
  barThickness: 5,
});

// Flag to control whether to auto-hide the loader after fetch.
let autoHideLoader = true;

export const setAutoHideLoader = (value: boolean) => {
  autoHideLoader = value;
};

const origFetch = window.fetch;
window.fetch = ((input, init?) => {
  if (showLoaderOnFetch(input)) {
    topbar.show();
  }
  return origFetch(input, init).then(
    (resp) => {
      if (autoHideLoader) {
        topbar.hide();
      }
      return resp;
    },
    (err) => {
      if (autoHideLoader) {
        topbar.hide();
      }
      throw err;
    }
  );
}) as typeof window.fetch;

export const LoaderContext = createContext({
  show: () => topbar.show(),
  hide: () => topbar.hide(),
});

export const useLoader = () => useContext(LoaderContext);
