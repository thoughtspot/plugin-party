import { render } from 'preact';
import '../index.scss';
import { App } from '../components/app';

// /* global document, Office, module, require, HTMLElement */

Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    console.log('PowerPoint add-in is ready', Office);
    render(<App isPowerpoint={true} />, document.getElementById('app'));
  } else {
    console.error('This add-in is intended for PowerPoint only.');
  }
});
