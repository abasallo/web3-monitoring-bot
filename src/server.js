import 'dotenv/config'

import Slack from './slack'

import { Kafka } from './kafka'

const activeSubscriptions = new Map()

const slack = new Slack(activeSubscriptions)

Kafka(slack, activeSubscriptions)
