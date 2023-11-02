export const EmbedTemplates = {
  SageEmbed: (params) => {
    const codeSnippet = `// Import ThoughtSpot SDK
import {
  SageEmbed,
  useEmbedRef,
  EmbedEvent,
} from "@thoughtspot/visual-embed-sdk/lib/src/react";
import { init, AuthType } from "@thoughtspot/visual-embed-sdk";
import "./styles.css";

init({
  thoughtSpotHost: "${params?.hostUrl}",
  authType: AuthType.None,
});

export default function App() {
  const embedRef = useEmbedRef();
  return (
    <SageEmbed
      frameParams={{
        height: 800,
        width: 1000,
      }}
      className="search-content"
      ref={embedRef}
      dataSources="${params?.worksheetId}"
    />
  );
};
`;
    return `${codeSnippet}`;
  },
};
