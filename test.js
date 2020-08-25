'use strict'

const got = require('got')

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

tap.skip('can insert records', t => {
	// reset db using http
	const dropTable = () => got.post('http://localhost', {
		port: 9925,
		headers: {
			Authorization: 'Basic SERCX0FETUlOOnBhc3N3b3Jk'
		},
		retry: 0,
		json: {
			'operation': 'drop_table',
			'schema': 'dev',
			'table': 'dog'
		}
	})

	const createTable = () => got.post('http://localhost', {
		port: 9925,
		headers: {
			Authorization: 'Basic SERCX0FETUlOOnBhc3N3b3Jk'
		},
		retry: 0,
		json: {
			'operation': 'create_table',
			'schema': 'dev',
			'table': 'dog',
			'hash_attribute': 'id'
		}
	})

	dropTable()
		.then(() => {
			createTable()
				.catch(err => {
					console.error(err)
					t.fail()
					t.end()
				})
		})
		.catch(err => {
			const { response } = err
			if (response && response.statusCode === 500 && JSON.parse(response.body)['error'] === 'Table \'dog\' does not exist in schema \'dev\'') {
				createTable()
					.catch(() => {
						t.fail()
						t.end()
					})
			} else {
				t.fail()
				t.end()
			}
		})

	client = new HarperDBWebSocketClient({
		hostname: 'localhost',
		socketClusterOptions,
		port: 1111,
		username: 'cluster_user',
		password: 'password',
		implicitInit: true
	})

	const schema = 'dev'
	const table = 'dog'
	const records = [
		{ id: '1', name: 'Harper', breed: 'Mutt' },
		{ id: '2', name: 'Penny', breed: 'Mutt' }
	]
	client.subscribe(`${schema}:${table}`, data => {
		console.log(data)
		t.equal(data.type, 'HDB_TRANSACTION')
		t.equal(data.transaction.operation, 'insert')
		t.equal(data.transaction.schema, schema)
		t.equal(data.transaction.table, table)
		t.same(data.transaction.records, records)
		t.equal(data.schema, schema)
		t.equal(data.table, table)
		t.end()
	})
	client.insert(`${schema}:${table}`, records)
})