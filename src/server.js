import 'dotenv/config'

import { App } from '@slack/bolt'

const app = new App({ token: process.env.SLACK_BOT_TOKEN, signingSecret: process.env.SLACK_SIGNING_SECRET })

app.start(process.env.PORT || 3000).then(() => console.log('⚡️ Bolt app is running!'))

app.message('hello', async ({ message, say }) => {
  await say(`Hey there <@${message.user}>!`)
})


app.message('subscribe', async ({ message, say }) => {
  if (message.text.includes('unsubscribe')) {
    await say(`Hey <@${message.user}>! I should be unsubscribing to something in: ${message}`)
  } else {
    await say(`Hey <@${message.user}>! I should be subscribing to something in: ${message}`)
  }
})
