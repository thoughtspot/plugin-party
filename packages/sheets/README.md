# Sheets TS Plugin

## Local Development

- Create a test script plugin for google sheets. This will be your personal dev plugin.
- Copy `.clasp.json.sample` to `.clasp.json`
- Add scriptId to the `.clasp.json` file.
- `$ clasp login` if not already done.

```
$ npm start
```

This should start the watch process and produce files in `dist` folder which should be pushed to a dev plugin.

This runs an automated `clasp push` to the google apps script as saved in the `.clasp.json` file above.

This will also serve the plugin application on `https://localhost:5173`.

- Go to the Google sheet where the test plugin was created. And open the plugin using the menu.
