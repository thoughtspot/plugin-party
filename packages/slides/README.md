# Slides TS Plugin

## Local Development

- Create a test script plugin for google slides. This will be your personal dev plugin.
- Copy `.clasp.json.sample` to `.clasp.json`
- Add scriptId to the `.clasp.json` file.
- `$ clasp login` if not already done.

```
$ npm start
```

This should start the watch process and produce files in `dist` folder which should be pushed to a dev plugin.

This runs an automated `clasp push` to the google apps script as mentioned in the `.clasp.json` file above.

This will also serve the plugin application on `https://localhost:5174`.

- Go to the Google sheet where the test plugin was created. And open the plugin using the menu.

## Deploy to Staging

- Build the slides plugin

```
$ cd plugin-party
$ nx run slides:build OR npx nx build slides
```

The built assets will be in the `build` folder, which need
to be served from a webserver, lets say at `slides-plugin.app.com`.

- Create `dist` files.

```
# From the `slides` dir.
$ HOST=slides-plugin.app.com npm run dist

OR

# From `plugin-party` dir.
$ HOST=slides-plugin.app.com nx run slides:dist
```

This creates the files in the `dist` directory which can be pushed to the slides plugin using something like `clasp`.

- Push using clasp

```
$ clasp push (from 'slides' dir)
```

To trigger above mentioned, `Deploy to Staging` workflow create and merge a PR into `staging` branch.

## To update and deploy production, merged PR from staging to main branch.