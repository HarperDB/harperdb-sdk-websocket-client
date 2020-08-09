'use strict'

const socketcluster = require('socketcluster-client')

class HarperDBWebSocketClient {
	constructor(options) {
		this.options = options

		if (!options.debug) {
			this.options.debug = process.env.NODE_ENV === 'development'
		}

		if (!options.socketClusterOptions) {
			this.options.socketClusterOptions = {
				rejectUnauthorized: false,
				autoConnect: true,
				secure: true,
				connectTimeout: 100000,
				ackTimeout: 10000,
				autoReconnectOptions: {
					initialDelay: 1000,
					maxDelay: 2000
				}
			}
		}

		if (options.implicitInit) {
			this.init()
		}
	}

	init() {
		if (this.options.implicitInit) {
			throw Error('init method already called by constructor due do option `implicitInit`')
		}

		this.socket = socketcluster.create({
			hostname: this.options.hostname,
			port: this.options.port,
			...this.options.socketClusterOptions
		})

		this.socket.on(
			'error',
			Object.prototype.hasOwnProperty.call(this.options.handlers, 'onError')
				? this.options.handlers.onError.bind(this) 
				: this.onError.bind(this)
		)
		this.socket.on(
			'login',
			Object.prototype.hasOwnProperty.call(this.options.handlers, 'onLogin')
				? this.options.handlers.onLogin.bind(this)
				: this.onLogin.bind(this)
		)
		this.socket.on(
			'connect',
			Object.prototype.hasOwnProperty.call(this.options.handlers, 'onConnect')
				? this.options.handlers.onConnect.bind(this)
				: this.onConnect.bind(this)
		)
	}

	onError (err) {
		if (this.options.throwOnSocketClusterError) {
			throw err
		} else if (this.options.debug) {
			console.error(err)
		}
	}

	onLogin (data, res) {
		if (this.options.debug) {
			console.log('login handler ', data, res)
		}

		res(null, { username: this.options.username, password: this.options.password })
	}

	onConnect (data, res) {
		if (this.options.debug) {
			console.log('connect handler ', data, res)
		}
	}

	validate(channel, records) {
		if (!Array.isArray(records) || records.length === 0){
			throw new Error('records must be an array with at least one entry')
		}
		const schemaTable = channel.split(':')
		if (schemaTable.length !== 2){
			throw new Error('invalid channel name')
		}
		return schemaTable
	}

	insert(channel, records) {
		const [schema, table] = this.validate(channel, records)
		const transaction = {
			operation: 'insert',
			schema: schema,
			table: table,
			records: records
		}
		const payload = this.createPayload(transaction, schema, table)
		if (this.options.debug) {
			console.log(`publishing insert event on channel ${channel} with `, payload)
		}
		this.socket.publish(channel, payload)
	}

	update(channel, records) {
		const [schema, table] = this.validate(channel, records)
		const transaction = {
			operation: 'update',
			schema: schema,
			table: table,
			records: records
		}
		const payload = this.createPayload(transaction, schema, table)
		if (this.options.debug) {
			console.log(`publishing update event on channel ${channel} with `, payload)
		}
		this.socket.publish(channel, payload)
	}

	delete(channel, hashes){
		const [schema, table] = this.validate(channel, hashes)
		const transaction = {
			operation: 'delete',
			schema: schema,
			table: table,
			hash_values: hashes
		}
		const payload = this.createPayload(transaction, schema, table)
		if (this.options.debug) {
			console.log(`publishing delete event on channel ${channel} with `, payload)
		}
		this.socket.publish(channel, payload)
	}

	createPayload(transaction, schema, table) {
		if (typeof transaction === 'object' && transaction !== undefined && transaction !== null) {
			throw Error(`1st argument ${transaction} must be a non-null object`)
		} else if (typeof schema !== 'string') {
			throw Error(`2nd argument ${schema} must be a string`)
		} else if (typeof table !== 'string') {
			throw Error(`3rd argument ${table} must be a string`)
		}

		return {
			hdb_header: { __data_source: 6 },
			type: 'HDB_TRANSACTION',
			schema: schema,
			table: table,
			__originator: { [this.socket.id]: 111 },
			transaction: transaction
		}
	}

	subscribe(channel, handler) {
		this.socket.subscribe(channel).watch(handler)
	}
}

module.exports = HarperDBWebSocketClient