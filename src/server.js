import 'dotenv/config'

import axios from 'axios'

import kafka from 'kafka-node'

import { App } from '@slack/bolt'

const app = new App({ token: process.env.SLACK_BOT_TOKEN, signingSecret: process.env.SLACK_SIGNING_SECRET })

const activeSubscriptions = new Map()

let channel = undefined

app.start(process.env.PORT || 3000).then(() => console.log('⚡️ Bolt app is running!'))

app.message('hello', async ({ message, say }) => {
  await say(`Hey there <@${message.user}>!`)
})

app.message('subscribe', ({ message, say }) => {
  try {
    channel = message.channel
    if (message.text.includes('unsubscribe')) {
      const walletID = message.text.split(' ').pop()
      unsubscribeFrom(walletID).then(() => say(`Hey <@${message.user}>! You are now unsubscribed from walletID: ${walletID}`))
    } else {
      const walletID = message.text.split(' ').pop()
      subscribeTo(walletID).then(() => say(`Hey <@${message.user}>! You are now subscribed to wallet with ID: ${walletID}`))
    }
  } catch (e) {
    console.error(e)
  }
})

const subscribeTo = walletID => {
  return axios.all([
    axios.post('http://localhost:8060/api/rest/v1/transaction', { type: 'FROM_ADDRESS', transactionIdentifierValue: walletID }),
    axios.post('http://localhost:8060/api/rest/v1/transaction', { type: 'TO_ADDRESS', transactionIdentifierValue: walletID })
  ]).then(responses => {
    console.log(`Transaction monitor FROM_ADDRESS ${walletID} created with ID: `, responses[0].data.id)
    console.log(`Transaction monitor TO_ADDRESS ${walletID} created with ID: `, responses[1].data.id)
    activeSubscriptions.set(walletID, { FROM_ADDRESS: responses[0].data.id, TO_ADDRESS: responses[1].data.id })
  })
}

const unsubscribeFrom = walletID => {
  return axios.all([
    axios.delete(`http://localhost:8060/api/rest/v1/transaction/${activeSubscriptions.get(walletID).FROM_ADDRESS}`),
    axios.delete(`http://localhost:8060/api/rest/v1/transaction/${activeSubscriptions.get(walletID).TO_ADDRESS}`)
  ]).then(() => {
    console.log(`Transaction monitors for walletID: ${walletID} with ids: ${activeSubscriptions.get(walletID).FROM_ADDRESS} & ${activeSubscriptions.get(walletID).TO_ADDRESS} deteled.`)
    activeSubscriptions.delete(walletID)
  })
}

const client = new kafka.KafkaClient({kafkaHost: 'localhost:9092'})
const consumer = new kafka.Consumer(client, [{ topic: 'transaction-events'}], { autoCommit: false })
consumer.on('message', message => {
  const parsedMessage = JSON.parse(message.value)
  if (doIFollow(parsedMessage.details.from, parsedMessage.details.from)) {
    app.client.chat.postMessage({ channel: channel, token: process.env.SLACK_BOT_TOKEN, text: parsedMessage })
    console.log(parsedMessage)
  }
})

const doIFollow = (from, to) => {
  for (const entry of activeSubscriptions.entries()) {
    if (entry[0] === from || entry[0] === to) return true
  }
  return false
}
