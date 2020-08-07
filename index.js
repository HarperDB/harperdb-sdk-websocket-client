// @ts-check

'use strict'

const socketcluster = require('socketcluster-client')
const assert = require('assert')

class HarperDBWebSocketClient {
	/**
	 *HarperDBWebSocketClient is powered by SocketCluster v14.
	 * Access the underlying websocket using the `socket` property on the class instance.
	 * Don't forget to initialize the connection using the {@link HarperDBWebSocketClient#init} method.
	 * 
	 * @param {Object} options
	 * @param {boolean} [options.throwOnSocketClusterError]
	 * @param {boolean} [options.debug]
	 * @param {string} options.hostname
	 * @param {number} options.port
	 * @param {string} options.username
	 * @param {string} options.password
	 */
	constructor(options) {
		this.options = options

		if (!options.debug) {
			this.options.debug = process.env.NODE_ENV === 'development'
		}

		/**
		 * Default SocketCluster options - useful for a standard or quick setup.
		 * 
		 * Will be completely overwritten by configuration options passed to {@link HarperDBWebSocketClient#init}
		 * 
		 * @typedef DefaultSocketClusterOptions
		 * @property {false} rejectUnauthorized
		 * @property {true} autoConnect
		 * @property {true} secure
		 * @property {100000} connectTimeout
		 * @property {10000} ackTimeout
		 * @property {object} autoReconnectOptions
		 * @property {1000} autoReconnectOptions.initialDelay
		 * @property {2000} autoReconnectOptions.maxDelay
		 */

		/** @type {DefaultSocketClusterOptions} */
		this.defaultSocketClusterOptions = {
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

	/**
	 * Initialize the SockerCluster websocket connection.
	 * Configure the connection using the first argument.
	 * Documentation for SocketCluster v14 can be found here: https://www.socketcluster.io/docs/14.4.2/api/
	 * 
	 * If you must override the onLogin event handler make sure that you call the second argument with `(null, { username: '<username>', password: '<password>' })`.
	 * 
	 * For example: 
	 * ```
	 * (data, res) => { 
	 * 	res(null, { username: 'admin', password: 'abc123' }) 
	 * }
	 * ```
	 * 
	 * @param {object} [socketClusterOptions=DefaultSocketClusterOptions]
	 * @param {object} [handlers] event handlers for the default error, login, and connect events. Will override default handlers.
	 * @param {(err: Error) => void} [handlers.onError] error event handler
	 * @param {(data: any, res: (err: any, credentials: { username: string, password: string }) => void ) => void} [handlers.onLogin] login event handler, must call response with authentication credentials. See usage docs for more details
	 * @param {(data: any, res: () => void ) => void} [handlers.onConnect] connect event handler
	 */
	init(socketClusterOptions = this.defaultSocketClusterOptions, handlers) {
		this.socket = socketcluster.create({
			hostname: this.options.hostname,
			port: this.options.port,
			...socketClusterOptions
		})

		this.socket.on('error', Object.prototype.hasOwnProperty.call(handlers, 'onError') ? handlers.onError.bind(this) : this.onError.bind(this))
		this.socket.on('login', Object.prototype.hasOwnProperty.call(handlers, 'onLogin') ? handlers.onLogin.bind(this) : this.onLogin.bind(this))
		this.socket.on('connect', Object.prototype.hasOwnProperty.call(handlers, 'onConnect') ? handlers.onConnect.bind(this) : this.onConnect.bind(this))
	}

	/**
	 * Internal error event handler
	 * @private
	 * @param {Error} err 
	 */
	onError (err) {
		if (this.options.throwOnSocketClusterError) {
			throw err
		} else if (this.options.debug) {
			console.error(err)
		}
	}

	/**
	 * Internal login event handler
	 * @private
	 * @param {*} data 
	 * @param {(err: any, credentials: { username: string, password: string }) => void} res 
	 */
	onLogin (data, res) {
		if (this.options.debug) {
			console.log('login handler ', data, res)
		}

		res(null, { username: this.options.username, password: this.options.password })
	}

	/**
	 * Internal connect event handler
	 * @private
	 * @param {*} data 
	 * @param {() => void} res 
	 */
	onConnect (data, res) {
		if (this.options.debug) {
			console.log('connect handler ', data, res)
		}
	}

	/**
	 * Used to validate the data attempting to be published to HarperDB
	 * @param {string} channel
	 * @param {object[]} records
	 * @returns {string[]} array tuple containing the channel schema (first) and table (second)
	 */
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

	/**
	 * Publishes an insert operation to a HarperDB channel
	 * @param {String} channel - name of the channel to publish to i.e. "dev:dog"
	 * @param {object[]} records - Object Array to insert
	 */
	insert(channel, records) {
		const [schema, table] = this.validate(channel, records)
		const transaction = {
			operation: 'insert',
			schema: schema,
			table: table,
			records: records
		}
		const data = this.createTransaction(transaction, schema, table)
		if (this.options.debug) {
			console.log(`publishing insert event on channel ${channel} with `, data)
		}
		this.socket.publish(channel, data)
	}

	/**
	 * Publishes an update operation to a HarperDB channel
	 * @param {string} channel - name of the channel to publish to i.e. "dev:dog"
	 * @param {object[]} records - Object Array to update
	 */
	update(channel, records) {
		const [schema, table] = this.validate(channel, records)
		const transaction = {
			operation: 'update',
			schema: schema,
			table: table,
			records: records
		}
		const data = this.createTransaction(transaction, schema, table)
		if (this.options.debug) {
			console.log(`publishing update event on channel ${channel} with `, data)
		}
		this.socket.publish(channel, data)
	}

	/**
	 * Publishes a delete operation to a HarperDB channel
	 * @param {string} channel - name of the channel to publish to i.e. "dev:dog"
	 * @param {string[]|number[]} hashes
	 */
	delete(channel, hashes){
		const [schema, table] = this.validate(channel, hashes)
		const transaction = {
			operation: 'delete',
			schema: schema,
			table: table,
			hash_values: hashes
		}
		const data = this.createTransaction(transaction, schema, table)
		if (this.options.debug) {
			console.log(`publishing delete event on channel ${channel} with `, data)
		}
		this.socket.publish(channel, data)
	}

	/**
	 * Wraps a HarperDB transaction into a clustering transaction object which will be understood to process in HarperDB
	 * @param {object} transaction - HarperDB transaction to wrap
	 * @param {string} schema - name of schema
	 * @param {string} table - name of table
	 * @returns {{schema: *, type: string, table: *, __originator: {}, transaction: *, hdb_header: {__data_source: number}}}
	 */
	createTransaction(transaction, schema, table) {
		// @ts-ignore
		assert(typeof transaction === 'object' && transaction !== undefined && transaction !== null, `1st argument ${transaction} must be a non-null object`)
		// @ts-ignore
		assert(typeof schema === 'string', `2nd argument ${schema} must be a string`)
		// @ts-ignore
		assert(typeof table === 'string', `3rd argument ${table} must be a string`)

		return {
			hdb_header: { __data_source: 6 },
			type: 'HDB_TRANSACTION',
			schema: schema,
			table: table,
			__originator: { [this.socket.id]: 111 },
			transaction: transaction
		}
	}

	/**
	 * Subscribes to a websocket channel. HarperDB uses `schema:table` for its channel names
	 * @param {string} channel event to be subscribed too
	 * @param {function} handler handler function for the event listener
	 */
	subscribe(channel, handler) {
		this.socket.subscribe(channel).watch(handler)
	}
}

module.exports = HarperDBWebSocketClient