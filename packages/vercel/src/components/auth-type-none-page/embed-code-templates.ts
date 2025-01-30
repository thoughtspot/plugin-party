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
    import ReactDOM from 'react-dom/client';
    import App from './App';
    const container = document.getElementById('app');
    const root = ReactDOM.createRoot(container);
    root.render(<App />);`;

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
import React from 'react';
import './style.css';
import { init, AuthType, SageEmbed } from '@thoughtspot/visual-embed-sdk/react';

// Initialize ThoughtSpot - note the host points to your current ThoughtSpot cluster
init({
  thoughtSpotHost: "${tsHostURL}",
  authType: AuthType.None,
});

export default function App() {
  return (
    <div>
    {/* ThoughtSpot Natural Language Search Embed */}
      <SageEmbed
        frameParams={{
          height: 1200,
        }}
        /* Using the datasource created earlier as the source of natural language queries.
         This source can be swapped later - check out the Developer Playground 
         for more customization options. */
        dataSource="${worksheetId}"
      />
    </div>
  );
}
`;
    return `${codeSnippet}`;
  },
  TrustedAuthSageEmbed: (
    tsHostURL,
    worksheetId,
    deploymentUrl,
    userName,
    currentOrgId
  ) => {
    const codeSnippet = `// Import ThoughtSpot SDK
    import React from 'react';
    import './style.css';
    import { init, AuthType, SageEmbed } from '@thoughtspot/visual-embed-sdk/react';

/*
Specify the username of the ThoughtSpot user you wish to use for logging in.
If the userName doesn't exist in ThoughtSpot, you can set auto_complete parameter
true to create a user just-in-time.
*/
const TSUserName = "${userName}";

// Initialize ThoughtSpot - note the host points to your current ThoughtSpot cluster
init({
  thoughtSpotHost: "${tsHostURL}",
  authType: AuthType.TrustedAuthToken,
  // Vercel deployed service domain so that secret key is not exposed
  getAuthToken: () => {
    /*
    This is your trusted auth service url which we have deployed
    in the previous step to generate ThoughtSpot token. Refer to this
    github repo for more info - https://github.com/thoughtspot/token-auth-service
    You can add the group names with group_identifiers as attribute
    This attribute can be used in conjunction with auto_create to 
    dynamically assign groups and privileges to a user.
    If you are using orgs, please mention orgId in the code snippet
    as well. Refer docs for more info - https://developers.thoughtspot.com/docs/api-authv2#trusted-auth-v2
    */
    return fetch("${deploymentUrl}/api/v2/gettoken/" + TSUserName, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({orgId: ${currentOrgId}})
    })
      .then((r) => r.text())
      .catch((e) => {
        console.log(e);
        return "";
      });
  },
  username: TSUserName,
});

export default function App() {
  return (
    <div>
    {/* ThoughtSpot Natural Language Search Embed */}
      <SageEmbed
        frameParams={{
          height: 1200,
        }}
        /* Using the datasource created earlier as the source of natural language queries.
         This source can be swapped later - check out the Developer Playground 
         for more customization options. */
        dataSource="${worksheetId}"
      />
    </div>
  );
}
`;
    return `${codeSnippet}`;
  },
};
