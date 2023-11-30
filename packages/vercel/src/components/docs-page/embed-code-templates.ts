export const EmbedTemplates = {
  PackageJSON: () => {
    const codeSnippet = `{
      "name": "m7xwqq--run",
      "version": "0.0.0",
      "private": true,
      "dependencies": {
        "react": "> 16.8.0",
        "react-dom": "> 16.8.0",
        "@thoughtspot/visual-embed-sdk": "1.24.0"
      }
    }`;
    return `${codeSnippet}`;
  },
  IndexJS: () => {
    const codeSnippet = `import React from 'react';
    import ReactDOM from 'react-dom';
    import App from './App';
    
    ReactDOM.render(<App />, document.getElementById('app'));`;

    return `${codeSnippet}`;
  },
  IndexHTML: () => {
    const codeSnippet = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your React App</title>
      </head>
      <body>
        <div id="app"></div>
      </body>
    </html>`;

    return `${codeSnippet}`;
  },
  SageEmbed: (tsHostURL, worksheetId) => {
    const codeSnippet = `// Import ThoughtSpot SDK
import './style.css';
import React from 'react';
import {
  init,
  AuthType,
  LiveboardEmbed,
  EmbedEvent,
  SageEmbed,
} from '@thoughtspot/visual-embed-sdk';

// Initialize ThoughtSpot - note the host points to your current ThoughtSpot cluster
init({
  thoughtSpotHost: "${tsHostURL}",
  authType: AuthType.None,
});

const NLSEmbed = () => {
  React.useEffect(() => {
    // Embed Sage - ThoughtSpot's natural language search
    const embed = new SageEmbed("#test", {
      // Using the datasource created earlier as the source of natural language queries.
      // This source can be swapped later - check out the Developer Playground 
      // for more customization options.
      dataSource: "${worksheetId}",
      frameParams: { width: 800, height: 600 },
    });

    embed
      .on(EmbedEvent.Init, () => console.log('Embed initialized'))
      .on(EmbedEvent.Load, () => console.log('Embed loaded'))
      .render();
  }, []);
  return <div className="test" id="test"></div>;
}

export default function App() {
  return <div className="App">{NLSEmbed()}</div>;
}
`;
    return `${codeSnippet}`;
  },
  TrustedAuthSageEmbed: (tsHostURL, worksheetId, deploymentUrl, userName) => {
    const codeSnippet = `// Import ThoughtSpot SDK
import './style.css';
import React from 'react';
import {
  init,
  AuthType,
  LiveboardEmbed,
  EmbedEvent,
  SageEmbed,
} from '@thoughtspot/visual-embed-sdk';

// username who wants to login to ThoughtSpot
const TSUserName = "${userName}";

// Initialize ThoughtSpot - note the host points to your current ThoughtSpot cluster
init({
  thoughtSpotHost: "${tsHostURL}",
  authType: AuthType.TrustedAuthToken,
  // Vercel deployed service domain so that secret key is not exposed
  getAuthToken: () => {
    return fetch("${deploymentUrl}/api/v2/gettoken/" + TSUserName)
      .then((r) => r.text())
      .catch((e) => {
        console.log(e);
        return "";
      });
  },
  username: TSUserName,
});

const NLSEmbed = () => {
  React.useEffect(() => {
    // Embed Sage - ThoughtSpot's natural language search
    const embed = new SageEmbed("#test", {
      // Using the datasource created earlier as the source of natural language queries.
      // This source can be swapped later - check out the Developer Playground 
      // for more customization options.
      dataSource: "${worksheetId}",
      frameParams: { width: 800, height: 600 },
    });

    embed
      .on(EmbedEvent.Init, () => console.log('Embed initialized'))
      .on(EmbedEvent.Load, () => console.log('Embed loaded'))
      .render();
  }, []);
  return <div className="test" id="test"></div>;
}

export default function App() {
  return <div className="App">{NLSEmbed()}</div>;
}
`;
    return `${codeSnippet}`;
  },
};
