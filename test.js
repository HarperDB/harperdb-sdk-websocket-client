'use strict'

const t = require('tap')
const sinon = require('sinon')
const rewire = require('rewire')
const EE = require('events')
const HarperDBWebSocketClient = rewire('./')

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