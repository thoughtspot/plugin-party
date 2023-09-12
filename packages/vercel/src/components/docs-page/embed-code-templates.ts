export const EmbedTemplates = {
  SearchEmbed: (url, secretKey, dataSourceId) => {
    return `// Import ThoughtSpot SDK
    import {
      SageEmbed,
      useEmbedRef,
      EmbedEvent,
    } from "@thoughtspot/visual-embed-sdk/lib/src/react";
    import { init, AuthType } from "@thoughtspot/visual-embed-sdk";
    import "./styles.css";
    
    init({
      thoughtSpotHost: ${url},
      authType: AuthType.TrustedAuthToken,
      username: "TO BE FILLED BY USER",
      getAuthToken: () => {
        return fetch(\`${url}api/rest/2.0/auth/token/full\`, {
          headers: { "content-type": "application/json" },
          body: \`{\\"username\\":\\"To Be Filled by user\\",\\"validity_time_in_sec\\":3000,\\"org_id\\":0,\\"auto_create\\":false,\\"secret_key\\":\\"${secretKey}\\"}\`,
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
          dataSources={[${dataSourceId}]}
        />
      );
    };
    `;
  },
  SageEmbed: (url, dataSourceId, secretKey) => {
    return `// Import ThoughtSpot SDK
    import {
      SageEmbed,
      useEmbedRef,
      EmbedEvent,
    } from "@thoughtspot/visual-embed-sdk/lib/src/react";
    import { init, AuthType } from "@thoughtspot/visual-embed-sdk";
    import "./styles.css";
    
    init({
      thoughtSpotHost: "${url}",
      authType: AuthType.TrustedAuthToken,
      username: "TO BE FILLED BY USER",
      getAuthToken: () => {
        return fetch(\`${url}api/rest/2.0/auth/token/full\`, {
          headers: { "content-type": "application/json" },
          body: \`{\\"username\\":\\"To Be Filled by user\\",\\"validity_time_in_sec\\":3000,\\"org_id\\":0,\\"auto_create\\":false,\\"secret_key\\":\\"${secretKey}\\"}\`,
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
          dataSources={[${dataSourceId}]}
        />
      );
    }`;
  },
};
