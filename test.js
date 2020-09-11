'use strict'

const t = require('tap')
const sinon = require('sinon')
const rewire = require('rewire')
const EE = require('events')
const HarperDBWebSocketClient = rewire('./')

t.test('default handlers should fire on specified events', t => {
	t.plan(3)

	const ee = new EE()

	const onConnectSpy = sinon.spy(HarperDBWebSocketClient.prototype, '_onConnect')
	const onErrorSpy = sinon.spy(HarperDBWebSocketClient.prototype, '_onError')
	const onLoginSpy = sinon.spy(HarperDBWebSocketClient.prototype, '_onLogin')

	const revert = HarperDBWebSocketClient.__set__('socketcluster', {
		create: () => ee
	})

	const client = new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username: '',
		password: ''
	})

	client.init()

	ee.emit('connect')
	ee.emit('error')
	ee.emit('login', null, () => {})

	t.true(onConnectSpy.calledOnce)
	t.true(onErrorSpy.calledOnce)
	t.true(onLoginSpy.calledOnce)

	HarperDBWebSocketClient.prototype._onConnect.restore()
	HarperDBWebSocketClient.prototype._onError.restore()
	HarperDBWebSocketClient.prototype._onLogin.restore()

	revert()
})

t.test('onLogin hook resolves with valid authentication object', t => {
	t.plan(2)

	const ee = new EE()

	const onLoginSpy = sinon.spy(HarperDBWebSocketClient.prototype, '_onLogin')

	const revert = HarperDBWebSocketClient.__set__('socketcluster', {
		create: () => ee
	})

	const username = 'foo'
	const password = 'bar'

	const client = new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username,
		password
	})

	client.init()

	const responseSpy = sinon.spy()
	ee.emit('login', null, responseSpy)

	t.true(onLoginSpy.calledOnce)
	t.true(responseSpy.calledWith(null, { username, password }))

	HarperDBWebSocketClient.prototype._onLogin.restore()
	revert()
})

t.test('configured handlers should fire on specified events', t => {
	t.plan(3)

	const ee = new EE()

	const revert = HarperDBWebSocketClient.__set__('socketcluster', {
		create: () => ee
	})

	const ONCONNECT = 'connect'
	const ONERROR = 'error'
	const ONLOGIN = 'login'

	const client = new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username: '',
		password: '',
		handlers: {
			onConnect: data => {
				t.equal(data, ONCONNECT)
			},
			onError: data => {
				t.equal(data, ONERROR)
			},
			onLogin: data => {
				t.equal(data, ONLOGIN)
			}
		}
	})

	client.init()

	ee.emit('connect', ONCONNECT)
	ee.emit('error', ONERROR)
	ee.emit('login', ONLOGIN)

	revert()
})

t.test('implicitInit should initialize the underlying socketcluster', t => {
	t.plan(1)

	const spy = sinon.spy(HarperDBWebSocketClient.prototype, 'init')

	const revert = HarperDBWebSocketClient.__set__('socketcluster', {
		create: () => ({ on: () => {} })
	})

	new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username: '',
		password: '',
		implicitInit: true
	})

	t.true(spy.calledOnce)

	HarperDBWebSocketClient.prototype.init.restore()
	revert()
})

t.test('socketClusterOptions should be defaulted', t => {
	t.plan(3)

	const client = new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username: '',
		password: ''
	})

	t.true(client.options.socketClusterOptions !== undefined)
	t.true(typeof client.options.socketClusterOptions === 'object')
	t.strictDeepEqual(client.options.socketClusterOptions, HarperDBWebSocketClient.defaultSocketClusterOptions)
})

t.test('socketClusterOptions should be overwritten', t => {
	t.plan(3)

	const socketClusterOptions = { foo: 'bar' }
	const client = new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username: '',
		password: '',
		socketClusterOptions
	})

	t.true(client.options.socketClusterOptions !== undefined)
	t.true(typeof client.options.socketClusterOptions === 'object')
	t.strictDeepEqual(client.options.socketClusterOptions, socketClusterOptions)
})

t.test('insert method publishes an insert operation', t => {
	const ee = new EE()

	Object.defineProperty(ee, 'publish', {
		value: (channel, payload) => ee.emit(channel, payload)
	})

	const revert = HarperDBWebSocketClient.__set__('socketcluster', {
		create: () => ee
	})

	const client = new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username: '',
		password: ''
	})

	client.init()

	const records = [{ id: '1', name: 'foo' }]
	const schema = 'dev'
	const table = 'dog'
	const channel = `${schema}:${table}`

	ee.on(channel, payload => {
		t.equal(payload.type, 'HDB_TRANSACTION')
		t.equal(payload.schema, schema)
		t.equal(payload.table, table)
		t.equal(payload.transaction.operation, 'insert')
		t.equal(payload.transaction.schema, schema)
		t.equal(payload.transaction.table, table)
		t.deepEqual(payload.transaction.records, records)
		t.end()
	})

	client.insert(channel, records)

	revert()
})

t.test('update method publishes an update operation', t => {
	const ee = new EE()

	Object.defineProperty(ee, 'publish', {
		value: (channel, payload) => ee.emit(channel, payload)
	})

	const revert = HarperDBWebSocketClient.__set__('socketcluster', {
		create: () => ee
	})

	const client = new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username: '',
		password: ''
	})

	client.init()

	const records = [{ id: '1', name: 'bar' }]
	const schema = 'dev'
	const table = 'dog'
	const channel = `${schema}:${table}`

	ee.on(channel, payload => {
		t.equal(payload.type, 'HDB_TRANSACTION')
		t.equal(payload.schema, schema)
		t.equal(payload.table, table)
		t.equal(payload.transaction.operation, 'update')
		t.equal(payload.transaction.schema, schema)
		t.equal(payload.transaction.table, table)
		t.deepEqual(payload.transaction.records, records)
		t.end()
	})

	client.update(channel, records)

	revert()
})

t.test('delete method publishes an delete operation', t => {
	const ee = new EE()

	Object.defineProperty(ee, 'publish', {
		value: (channel, payload) => ee.emit(channel, payload)
	})

	const revert = HarperDBWebSocketClient.__set__('socketcluster', {
		create: () => ee
	})

	const client = new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username: '',
		password: ''
	})

	client.init()

	const hash_values = [{ id: '1' }, { id: '2'}]
	const schema = 'dev'
	const table = 'dog'
	const channel = `${schema}:${table}`

	ee.on(channel, payload => {
		t.equal(payload.type, 'HDB_TRANSACTION')
		t.equal(payload.schema, schema)
		t.equal(payload.table, table)
		t.equal(payload.transaction.operation, 'delete')
		t.equal(payload.transaction.schema, schema)
		t.equal(payload.transaction.table, table)
		t.deepEqual(payload.transaction.hash_values, hash_values)
		t.end()
	})

	client.delete(channel, hash_values)

	revert()
})

t.test('subscribe method subscribes to socketcluster channel with given handler', t => {
	t.plan(1)
	const ee = new EE()

	Object.defineProperty(ee, 'subscribe', {
		value: channel => ({ watch: handler => ee.on(channel, handler) })
	})

	const revert = HarperDBWebSocketClient.__set__('socketcluster', {
		create: () => ee
	})

	const client = new HarperDBWebSocketClient({
		hostname: '',
		port: 0,
		username: '',
		password: ''
	})

	client.init()

	const spy = sinon.spy()
	const channel = 'foo'

	client.subscribe(channel, spy)

	ee.emit(channel)

	t.true(spy.calledOnce)

	revert()
})