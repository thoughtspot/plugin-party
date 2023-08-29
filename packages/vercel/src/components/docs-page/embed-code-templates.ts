export const EmbedTemplates = {
  SearchEmbed: (url) => {
    return `// Import ThoughtSpot SDK
    import {
      init,
      SearchEmbed,
      EmbedEvent,
      AuthType,
    } from "@thoughtspot/visual-embed-sdk";
    import "./styles.css";
    
    // Write Javascript code!
    init({
      thoughtSpotHost: "${url}",
      authType: AuthType.None,
      /*param-start-styleCustomization*//*param-end-styleCustomization*/
    });
    
    // Instantiate SearchEmbed class
    const embed = new SearchEmbed("#your-own-div", {
        frameParams: {},
          dataSources: ["cd252e5c-b552-49a8-821d-3eadaa049cca"],
    });
    
    embed
      // Register event handlers
      .on(EmbedEvent.Init, showLoader)
      .on(EmbedEvent.Load, hideLoader)
      .on(EmbedEvent.AuthExpire, showAuthExpired)
      /*param-start-customActionHandle*//*param-end-customActionHandle*/
      .on("answerPageLoading", payload =>
        console.log("message received from embedded view" + JSON.stringify(payload))
      )
      // Render the embedded search and pass in the data source id
      .render();
    
    // Function to show/hide
    function setDisplayStyle(el, style) {
      if(document.getElementById(el)) {
        document.getElementById(el).style.display = style;
      }
    }
    
    // Functions to show and hide a loader while iframe loads
    function showLoader() {
      setDisplayStyle("loader", "block");
    }
    function hideLoader() {
      setDisplayStyle("loader", "none");
    }
    
    function showAuthExpired() {
      setDisplayStyle("authExpiredBanner", "flex");
    }
    `;
  },
  SageEmbed: (url) => {
    return `// Import ThoughtSpot SDK
    import {
      init,
      SageEmbed,
      EmbedEvent,
      AuthType,
    } from "@thoughtspot/visual-embed-sdk";
    import "./styles.css";
    
    // Initialize embed configuration
    init({
      thoughtSpotHost:"${url}",
      authType: AuthType.None,
      /*param-start-styleCustomization*//*param-end-styleCustomization*/
    });
    
    // Instantiate class for embedding the full application
    const embed = new SageEmbed("#your-own-div", {
        frameParams: {},
        /*param-start-sageDataSource*/
          dataSource: "cd252e5c-b552-49a8-821d-3eadaa049cca",
    });
    
    embed
      // Register event listeners
      .on(EmbedEvent.Init, showLoader)
      .on(EmbedEvent.Load, hideLoader)
      .on(EmbedEvent.AuthExpire, showAuthExpired)
      /*param-start-customActionHandle*//*param-end-customActionHandle*/
      .render();
    
    /*param-start-useHostEvent*/
    /*param-end-useHostEvent*/
    
    // Function to show/hide
    function setDisplayStyle(el, style) {
      if(document.getElementById(el)) {
        document.getElementById(el).style.display = style;
      }
    }
    
    // Functions to show and hide a loader while iframe loads
    function showLoader() {
      setDisplayStyle("loader", "block");
    }
    function hideLoader() {
      setDisplayStyle("loader", "none");
    }
    
    function showAuthExpired() {
      setDisplayStyle("authExpiredBanner", "flex");
    }`;
  },
};
