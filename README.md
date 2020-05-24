# web3-monitoring-bot

Web3 Monitoring Slack Bot using Bolt

## Notes to the reviewer

This is the server for a conversational Slack App Bot over https://github.com/keyko-io/web3-monitoring-agent answering to:

- hello
- subscribe _address_
- unsubscribe _address_
  
While the subscription is active, logs any incoming/outgoing activity to/from the given address into the default bot's chat.

See this video: https://youtu.be/R4d3DThDG50 (_any secret shown in the video is been already revoked and regenerated_) for an E2E demonstration and further environment configuration instructions.

**This app is just a POC, before becoming production code, or something that can evolve to it; should be appropriately test covered.**

**For the same reason, mostly only the _Golden Path_ is covered, and it could definitely benefit from robuster error handling, subscription cleaning before shutting down, etc.**

## Preexisting necessary environment

This projects needs and assumes https://github.com/keyko-io/web3-monitoring-agent installed & configured with Infura / Ropsten (check link & next section for details).

Needs also slack application (http://api.slack.com/) created / configured and installed in a test workspace (see previous section video for details).

## Initial configuration

In the project directory, you must copy .env.example as .env a fill as needed (e.g. SLACK_SIGNING_SECRET & SLACK_BOT_TOKEN).

Also in the project directory, you can run:

### `npm install`

To download dependencies into node_modules directory.

## Available Scripts

In the project directory, you can run:

### `npm run lint`

Runs the linter.

### `npm test`

Launches the runner for Unit & Integration tests.

### `npm run dev`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run debug`

Runs the app in the development and debug mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
Connect to [http://localhost:9229](http://localhost:9229) to debug.

### `npm run build`

Builds the app for production to the `build` folder.<br />

### `npm starts`

Runs the app in production mode.
