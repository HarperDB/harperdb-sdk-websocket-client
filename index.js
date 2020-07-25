'use strict'

import socketcluster from 'socketcluster-client'

class HarperDBWebSocketClient {
	constructor(options) {
		this.options = options
		this.defaultOptions = {
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

	init(socketclusterOptions = this.defaultOptions) {
		this.socket = socketcluster.create({
			hostname: this.options.hostname,
			port: this.options.clusterPort,
			...socketclusterOptions
		})

		this.socket.on('error', this.errorHandler.bind(this))
		this.socket.on('connect', this.connectHandler.bind(this))
	}

	errorHandler (err) {
		console.error(err)
	}

	connectHandler () {
		console.log('Connected')
	}
}

export default HarperDBWebSocketClient