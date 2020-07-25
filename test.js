import tap from 'tap'
import HarperDBWebSocketClient from './index'

const client = new HarperDBWebSocketClient({
	hostname: 'http://localhost',
	port: 31283,
	username: 'HDB_ADMIN',
	password: 'password'
})

client.init({})

tap.pass()
