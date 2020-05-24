import kafka from 'kafka-node'

const doIFollow = (from, to, activeSubscriptions) => {
  for (const entry of activeSubscriptions.entries()) {
    if (entry[0] === from || entry[0] === to) return true
  }
  return false
}

export const Kafka = (slack, activeSubscriptions) => {
  const client = new kafka.KafkaClient({ kafkaHost: `${process.env.KAFKA_URL_HOST}:${process.env.KAFKA_URL_PORT}` })
  const consumer = new kafka.Consumer(client, [{ topic: `${process.env.KAFKA_TRANSACTION_EVENTS_TOPIC}` }], { autoCommit: false })

  consumer.on('message', (message) => {
    const parsedMessage = JSON.parse(message.value)
    if (doIFollow(parsedMessage.details.from, parsedMessage.details.to, activeSubscriptions)) {
      slack.app.client.chat.postMessage({ channel: slack.channel, token: process.env.SLACK_BOT_TOKEN, text: parsedMessage })
      console.log(parsedMessage)
    }
  })
}
