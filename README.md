# HarperDB Websocket Client

![Test suite](https://github.com/harperdb/harperdb-websocket-client/workflows/Test%20suite/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
![GitHub](https://img.shields.io/github/license/harperdb/harperdb-sdk-websocket-client)

A HarperDB WebSocket Client SDK powered by SocketCluster

## Getting started

```js
npm i -s harperdb-websocket-client
```

or

```js
yarn add harperdb-websocket-client
```

## Documentation

```js
const HarperDBWebSocketClient = require('harperdb-websocket-client')
```

##### defaultSocketClusterOptions
```js
{
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
```
##### Example
```js
const client = new HarperDBWebSocketClient({
  debug: true,
  implicitInit: true,
  handlers: {
    onError: err => {
      console.error(err)
    }
  }
})
```

#### init()

Initializes the socket cluster instance with the options passed in via the constructor method.

Do not call if `options.implicitInit` was enabled.

```js
const client = new HarperDBWebSocketClient() // options.implicitInit is not enabled
client.init()
```
#### subscribe(channel, handler)

Subscribes to a socket controller channel with the given handler.

- **channel** - _string_ - channel to be subscribed to. Should be in the format `"schema:table"`
- **handler** - _function_ - function to be executed when channel recieves an update

##### Example
```js
client.subscribe('dev:dog', data => {
  // do something with data
})
```

#### insert(channel, records)

Creates and publishes an insert transaction on the given channel with the given records.

```js
client.insert(`dev:dog`, [
  {
    id: '1',
    name: 'Harper',
    breed: 'Mutt'
  },
  {
    id: '2',
    name: 'Penny',
    breed: 'Mutt'
  }
])
```
#### update(channel, records)

Creates and publishes an udpate transaction on the given channel with the given records.

```js
client.update(`dev:dog`, [
  {
    id: '1',
    breed: 'Lab'
  }
])
```

#### delete(channel, records)

Creates and publishes a delete transaction on the given channel with the given records.

```js
client.delete(`dev:dog`, [
  { id: '2' }
])
```

[click here to read the jsDoc markdown](api.md)


## License

MIT, see [license file](LICENSE)
