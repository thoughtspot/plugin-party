export const EmbedTemplates = {
  SearchEmbed: (params) => {
    return `// Import ThoughtSpot SDK
    import {
      SearchEmbed,
      useEmbedRef,
      EmbedEvent,
    } from "@thoughtspot/visual-embed-sdk/lib/src/react";
    import { init, AuthType } from "@thoughtspot/visual-embed-sdk";
    import "./styles.css";
    
    init({
      thoughtSpotHost: ${params?.hostUrl},
      authType: AuthType.TrustedAuthToken,
      username: "TO BE FILLED BY USER",
      getAuthToken: () => {
        return fetch(\`${params?.authUrl}/api/v2/gettoken/:user\`, {
          headers: { "content-type": "application/json" },
          body: \`{\\"username\\":\\"To Be Filled by user\\",\\"validity_time_in_sec\\":3000,\\"org_id\\":0,\\"auto_create\\":false,\\"secret_key\\":\\"secretKey\\"}\`,
          method: "POST",
        })
        .then((response) => response.json())
        .then((data) => data.token);
      }
    });

    export const SearchEmbed = () => {
      const embedRef = useEmbedRef();
      return (
        <SearchEmbed
          frameParams={{
            height: 800,
            width: 1000,
          }}
          className="search-content"
          ref={embedRef}
          dataSources={['nirmayPatel']}
        />
      );
    };
    `;
  },
  SageEmbed: (params) => {
    return `// Import ThoughtSpot SDK
    import {
      SageEmbed,
      useEmbedRef,
      EmbedEvent,
    } from "@thoughtspot/visual-embed-sdk/lib/src/react";
    import { init, AuthType } from "@thoughtspot/visual-embed-sdk";
    import "./styles.css";
    
    init({
      thoughtSpotHost: "${params?.hostUrl}",
      authType: AuthType.TrustedAuthToken,
      username: "TO BE FILLED BY USER",
      getAuthToken: () => {
        return fetch(\`${params?.authUrl}/api/v2/gettoken/:user\`, {
          headers: { "content-type": "application/json" },
          body: \`{\\"username\\":\\"To Be Filled by user\\",\\"validity_time_in_sec\\":3000,\\"org_id\\":0,\\"auto_create\\":false,\\"secret_key\\":\\"secretKey\\"}\`,
          method: "POST",
        })
        .then((response) => response.json())
        .then((data) => data.token);
      }
    });

    export const SageEmbed = () => {
      const embedRef = useEmbedRef();
      return (
        <SageEmbed
          frameParams={{
            height: 800,
            width: 1000,
          }}
          className="search-content"
          ref={embedRef}
          dataSources={['nirmayPatel']}
        />
      );
    }`;
  },
  LiveboardEmbed: (params) => {
    return `// Import ThoughtSpot SDK
    import {
      LiveboardEmbed,
      useEmbedRef,
      EmbedEvent,
    } from "@thoughtspot/visual-embed-sdk/lib/src/react";
    import { init, AuthType } from "@thoughtspot/visual-embed-sdk";
    import "./styles.css";
    
    init({
      thoughtSpotHost: ${params?.hostUrl},
      authType: AuthType.TrustedAuthToken,
      username: "TO BE FILLED BY USER",
      getAuthToken: () => {
        return fetch(\`${params?.authUrl}/api/v2/gettoken/:user\`, {
          headers: { "content-type": "application/json" },
          body: \`{\\"username\\":\\"To Be Filled by user\\",\\"validity_time_in_sec\\":3000,\\"org_id\\":0,\\"auto_create\\":false,\\"secret_key\\":\\"secretKey\\"}\`,
          method: "POST",
        })
        .then((response) => response.json())
        .then((data) => data.token);
      }
    });

    export const LiveboardEmbed = () => {
      const embedRef = useEmbedRef();
      return (
        <LiveboardEmbed
          frameParams={{
            height: 800,
            width: 1000,
          }}
          className="search-content"
          ref={embedRef}
          liveboardId={${params?.livebaordId}}
        />
      );
    };
    `;
  },
};
