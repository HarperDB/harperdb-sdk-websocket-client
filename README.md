# harperdb-sdk-websocket-client

Default SocketCluster options - useful for a standard or quick setup.

init
Initialize the SockerCluster websocket connection.
Configure the connection using the first argument.
Documentation for SocketCluster v14 can be found here: https://www.socketcluster.io/docs/14.4.2/api/

If you must override the onLogin event handler make sure that you call the second argument with `(null, { username: '<username>', password: '<password>' })`.

For example: 
```js
(data, res) => { 
	res(null, { username: 'admin', password: 'abc123' }) 
}
```