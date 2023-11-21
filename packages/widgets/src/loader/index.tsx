import topbar from 'topbar';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { showLoaderOnFetch } from './loader-util';

topbar.config({
  barThickness: 5,
});

const origFetch = window.fetch;
window.fetch = ((input, init?) => {
  if (showLoaderOnFetch(input)) {
    topbar.show();
  }
  return origFetch(input, init).then(
    (resp) => {
      topbar.hide();
      return resp;
    },
    (err) => {
      topbar.hide();
      return err;
    }
  );
}) as typeof window.fetch;

export const LoaderContext = createContext({
  show: () => topbar.show(),
  hide: () => topbar.hide(),
});

export const useLoader = () => useContext(LoaderContext);
