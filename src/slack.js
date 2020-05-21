import { App } from '@slack/bolt'

import axios from 'axios'

const eventeumURL = `${process.env.EVENTEUM_URL_HOST}:${process.env.EVENTEUM_URL_PORT}/api/rest/v1/${process.env.EVENTEUM_URL_TRANSACTION}/`

const subscribeTo = (walletID, activeSubscriptions) => {
  return axios
    .all([
      axios.post(eventeumURL, { type: 'FROM_ADDRESS', transactionIdentifierValue: walletID }),
      axios.post(eventeumURL, { type: 'TO_ADDRESS', transactionIdentifierValue: walletID }),
    ])
    .then((responses) => {
      console.log(`Transaction monitor FROM_ADDRESS ${walletID} created with ID: `, responses[0].data.id)
      console.log(`Transaction monitor TO_ADDRESS ${walletID} created with ID: `, responses[1].data.id)
      activeSubscriptions.set(walletID, { FROM_ADDRESS: responses[0].data.id, TO_ADDRESS: responses[1].data.id })
    })
}

const unsubscribeFrom = (walletID, activeSubscriptions) => {
  return axios
    .all([
      axios.delete(eventeumURL + activeSubscriptions.get(walletID).FROM_ADDRESS),
      axios.delete(eventeumURL + activeSubscriptions.get(walletID).TO_ADDRESS),
    ])
    .then(() => {
      console.log(`Transaction monitors for walletID: ${walletID} with ids: ${activeSubscriptions.get(walletID).FROM_ADDRESS} & 
        ${activeSubscriptions.get(walletID).TO_ADDRESS} deteled.`)
      activeSubscriptions.delete(walletID)
    })
}

export default class Slack {
  constructor(activeSubscription) {
    this.activeSubscription = activeSubscription
    this.app = new App({ token: process.env.SLACK_BOT_TOKEN, signingSecret: process.env.SLACK_SIGNING_SECRET })

    this.app.message('hello', ({ message, say }) => say(`Hey there <@${message.user}>!`))

    this.app.message('subscribe', ({ message, say }) => {
      try {
        this.channel = message.channel
        if (message.text.includes('unsubscribe')) {
          const walletID = message.text.split(' ').pop()
          unsubscribeFrom(walletID, this.activeSubscription).then(() =>
            say(`Hey <@${message.user}>! You are now unsubscribed from walletID: ${walletID}`)
          )
        } else {
          const walletID = message.text.split(' ').pop()
          subscribeTo(walletID, this.activeSubscription).then(() =>
            say(`Hey <@${message.user}>! You are now subscribed to wallet with ID: ${walletID}`)
          )
        }
      } catch (e) {
        console.error(e)
      }
    })

    this.app.start(process.env.PORT || 3000).then(() => console.log('⚡️ Bolt slackApp is running!'))
  }
}
