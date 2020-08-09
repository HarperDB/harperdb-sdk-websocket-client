// @ts-check

'use strict'

// const tap = require('tap')
const HarperDBWebSocketClient = require('./index.js')

const client = new HarperDBWebSocketClient({
	hostname: 'localhost',
	port: 1111,
	username: 'cluster_user',
	password: 'password',
	throwOnSocketClusterError: true,
	implicitInit: true
})

// client.init()

client.subscribe('dev:dog', data => {
	console.log(data)
})

client.insert(
	'dev:dog',
	[
		{
			id: 1,
			dogName: 'Penny'
		}
	]
)

// tap.pass()

