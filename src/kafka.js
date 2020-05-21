import kafka from 'kafka-node'

const doIFollow = (from, to, activeSubscriptions) => {
  for (const entry of activeSubscriptions.entries()) {
    if (entry[0] === from || entry[0] === to) return true
  }
  return false
}

export default class Kafka {
  constructor(slack, activeSubscriptions) {
    this.activeSubscriptions = activeSubscriptions
    this.client = new kafka.KafkaClient({ kafkaHost: `${process.env.KAFKA_URL_HOST}:${process.env.KAFKA_URL_PORT}` })
    this.consumer = new kafka.Consumer(this.client, [{ topic: `${process.env.KAFKA_TRANSACTION_EVENTS_TOPIC}` }], { autoCommit: false })
    this.slack = slack

    this.consumer.on('message', (message) => {
      const parsedMessage = JSON.parse(message.value)
      if (doIFollow(parsedMessage.details.from, parsedMessage.details.to, this.activeSubscriptions)) {
        this.slack.app.client.chat.postMessage({ channel: this.slack.channel, token: process.env.SLACK_BOT_TOKEN, text: parsedMessage })
        console.log(parsedMessage)
      }
    })
  }
}
