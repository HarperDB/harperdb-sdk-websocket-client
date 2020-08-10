'use strict'

const tap = require('tap')
const HarperDBWebSocketClient = require('./index.js')

const socketClusterOptions = {
	rejectUnauthorized: false,
	autoReconnect: false,
	ackTimeout: 10000,
	secure: true
}

let client

tap.afterEach(done => {
	if (Object.prototype.hasOwnProperty.call(client, 'socket')) {
		client.socket.destroy()
	}

	done()
})

tap.test('connect handler fires', t => {
	client = new HarperDBWebSocketClient({
		hostname: 'localhost',
		socketClusterOptions,
		port: 1111,
		username: 'cluster_user',
		password: 'password',
		handlers: {
			onConnect: (data) => {
				t.true(Object.prototype.hasOwnProperty.call(data, 'id'))
				t.true(Object.prototype.hasOwnProperty.call(data, 'pingTimeout'))
				t.true(Object.prototype.hasOwnProperty.call(data, 'isAuthenticated'))
				t.true(Object.prototype.hasOwnProperty.call(data, 'authToken'))
				t.end()
			}
		}
	})
	client.init()
})

tap.test('connect handler fires with implicitInit', t => {
	client = new HarperDBWebSocketClient({
		hostname: 'localhost',
		socketClusterOptions,
		port: 1111,
		username: 'cluster_user',
		password: 'password',
		handlers: {
			onConnect: (data) => {
				t.true(Object.prototype.hasOwnProperty.call(data, 'id'))
				t.true(Object.prototype.hasOwnProperty.call(data, 'pingTimeout'))
				t.true(Object.prototype.hasOwnProperty.call(data, 'isAuthenticated'))
				t.true(Object.prototype.hasOwnProperty.call(data, 'authToken'))
				t.end()
			}
		},
		implicitInit: true
	})
})

tap.test('login handler fires', t => {
	client = new HarperDBWebSocketClient({
		hostname: 'localhost',
		socketClusterOptions,
		port: 1111,
		username: 'cluster_user',
		password: 'password',
		handlers: {
			onLogin: (data) => {
				t.equal(data, 'send login credentials')
				t.end()
			}
		}
	})
	client.init()
})
