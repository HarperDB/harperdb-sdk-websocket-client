// @ts-check

'use strict'

const socketcluster = require('socketcluster-client')

class HarperDBWebSocketClient {
	/**
	 *HarperDBWebSocketClient is powered by SocketCluster v14.
	 * Access the underlying websocket using the `socket` property on the class instance.
	 * Don't forget to initialize the connection using the {@link HarperDBWebSocketClient#init} method.
	 * 
	 * @param {Object} options
	 * @param {boolean} [options.throwOnSocketClusterError]
	 * @param {string} options.hostname
	 * @param {number} options.port
	 * @param {string} options.username
	 * @param {string} options.password
	 */
	constructor(options) {
		this.options = options

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
	 * @param {*} [socketClusterOptions=DefaultSocketClusterOptions]
	 */
	init(socketClusterOptions = this.defaultSocketClusterOptions) {
		this.socket = socketcluster.create({
			hostname: this.options.hostname,
			port: this.options.port,
			...socketClusterOptions
		})

		this.socket.on('error', this.errorHandler.bind(this))
		this.socket.on('login', this.loginHandler.bind(this))
		this.socket.on('connect', this.connectHandler.bind(this))
	}

	/**
	 * Internal error event handler
	 * @private
	 * @param {Error} err 
	 */
	errorHandler (err) {
		if (this.options.throwOnSocketClusterError) {
			throw err
		} else {
			console.error(err)
		}
	}

	/**
	 * Internal login event handler
	 * @private
	 * @param {*} data 
	 * @param {*} res 
	 */
	loginHandler (data, res) {
		if (process.env.NODE_ENV === 'development') {
			console.log('login handler ', data, res)
		}
	}

	/**
	 * Internal connect event handler
	 * @private
	 * @param {*} data 
	 * @param {*} res 
	 */
	connectHandler (data, res) {
		if (process.env.NODE_ENV === 'development') {
			console.log('connect handler ', data, res)
		}
		console.log('Connected')
	}

	/**
	 * Used to validate the data attempting to be published to HarperDB
	 * @param {string} channel
	 * @param {object[]} records
	 * @returns {*}
	 */
	publishValidation(channel, records){
		if (!Array.isArray(records) || records.length === 0){
			throw new Error('records must be an array with at least one entry')
		}
		const schema_table = channel.split(':')
		if (schema_table.length !== 2){
			throw new Error('invalid channel name')
		}
		return schema_table
	}

	/**
	 * Publishes an insert operation to a HarperDB channel (table)
	 * @param {String} channel - name of the channel to publish to i.e. "dev:dog"
	 * @param {object[]} records - Object Array to insert
	 */
	publishInsert(channel, records){
		const schema_table = this.publishValidation(channel, records)
		const transaction = {
			operation: 'insert',
			schema: schema_table[0],
			table: schema_table[1],
			records: records
		}
		const publish_object = this.createTransaction(transaction, schema_table[0], schema_table[1])
		this.socket.publish(channel, publish_object)
	}

	/**
	 * Publishes an update operation to a HarperDB channel (table)
	 * @param {string} channel - name of the channel to publish to i.e. "dev:dog"
	 * @param {object[]} records - Object Array to update
	 */
	publishUpdate(channel, records){
		const schema_table = this.publishValidation(channel, records)
		const transaction = {
			operation: 'update',
			schema: schema_table[0],
			table: schema_table[1],
			records: records
		}
		const publish_object = this.createTransaction(transaction, schema_table[0], schema_table[1])
		this.socket.publish(channel, publish_object)
	}

	/**
	 * Publishes a delete operation to a HarperDB channel (table)
	 * @param {string} channel - name of the channel to publish to i.e. "dev:dog"
	 * @param {string[]|number[]} hashes
	 */
	publishDelete(channel, hashes){
		const schema_table = this.publishValidation(channel, hashes)
		const transaction = {
			operation: 'delete',
			schema: schema_table[0],
			table: schema_table[1],
			hash_values: hashes
		}
		const publish_object = this.createTransaction(transaction, schema_table[0], schema_table[1])
		this.socket.publish(channel, publish_object)
	}

	/**
	 * Wraps a HarperDB transaction into a clustering transaction object which will be understood to process in HarperDB
	 * @param {object} transaction - HarperDB transaction to wrap
	 * @param {string} schema - name of schema
	 * @param {string} table - name of table
	 * @returns {{schema: *, type: string, table: *, __originator: {}, transaction: *, hdb_header: {__data_source: number}}}
	 */
	createTransaction(transaction, schema, table){
		const transaction_object = {
			hdb_header:{__data_source:6},
			type: 'HDB_TRANSACTION',
			schema: schema,
			table: table,
			__originator:{},
			transaction: transaction
		}
		transaction_object.__originator[this.socket.id] = 111
		return transaction_object
	}
}

module.exports = HarperDBWebSocketClient