// @ts-check

'use strict'

const tap = require('tap')
const HarperDBWebSocketClient = require('./index.js')

const client = new HarperDBWebSocketClient({
	hostname: 'localhost',
	port: 1111,
	username: 'CLUSTER_USER',
	password: '1400',
	throwOnSocketClusterError: true
})

client.init()

tap.pass()

