const got = require('got')
const HarperDBWebSocketClient = require('./index.js')

const client = new HarperDBWebSocketClient({
	hostname: 'localhost',
	socketClusterOptions: {
		rejectUnauthorized: false,
		autoReconnect: false,
		ackTimeout: 10000,
		secure: true
	},
	port: 1111,
	username: 'cluster_user',
	password: 'password',
	debug: true,
	implicitInit: true
})

client.subscribe('dev:dog', (arg1, arg2) => {
	console.log(arg1, arg2)
})

const dropSchema = () => got.post('http://localhost', {
	port: 9925,
	headers: {
		Authorization: 'Basic SERCX0FETUlOOnBhc3N3b3Jk'
	},
	retry: 0,
	json: {
		'operation': 'drop_schema',
		'schema': 'dev'
	}
})

const createSchema = () => got.post('http://localhost', {
	port: 9925,
	headers: {
		Authorization: 'Basic SERCX0FETUlOOnBhc3N3b3Jk'
	},
	retry: 0,
	json: {
		'operation': 'create_schema',
		'schema': 'dev'
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

const describeTable = () => got.post('http://localhost', {
	port: 9925,
	headers: {
		Authorization: 'Basic SERCX0FETUlOOnBhc3N3b3Jk'
	},
	retry: 0,
	json: {
		'operation': 'describe_table',
		'schema': 'dev',
		'table': 'dog'
	}
})

dropSchema()
	.then(() => createSchema())
	.then(() => createTable())
	.catch(({ response }) => {
		const err = JSON.parse(response.body)
		if (err.error === 'Schema \'dev\' does not exist') {
			createSchema().then(() => createTable())
		}

		console.error(err)
	})

setTimeout(() => {
	client.insert('dev:dog', [
		{ id: '1', name: 'Harper', breed: 'Mutt' },
		{ id: '2', name: 'Penny', breed: 'Mutt' }
	])

	setTimeout(() => {
		describeTable()
			.then(( response ) => {
				console.log(JSON.parse(response.body))
			})
			.catch(err => {
				console.error(err)
			})
	}, 1000)
}, 1000)
