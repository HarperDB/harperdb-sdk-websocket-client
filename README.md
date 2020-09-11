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

# API

## Class: **HarperDBWebSocketClient**

```js
const HarperDBWebSocketClient = require('harperdb-sdk-websocket-client')
```

### Properties

#### **options** _object_
Initialized by the constructor using whatever is passed in as the first argument to the constructor.

#### **initialized** _boolean_
This property is used by the [init](#init) method to prevent the reinitialization of the socket cluster connection.

It is recommended to treat this property as readonly to prevent unintended side effects.

#### **defaultSocketClusterOptions** _object_
Default SocketCluster options. Do not override.
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

### Methods

#### constructor([options: object])

##### options
| property | type | default | description |
| - | - | - | - |
| debug | boolean | `false` | When enabled, implicit handlers will log debugger information. Setting the `NODE_ENV` environment variable to `"development"` will enable this property. |
| implicitInit | boolean | `false` | When enabled, will implicitly call the [init](#init) method. As shown in the examples, if not enabled you **must** call the `init` method yourself. |
| socketClusterOptions | object | _see [defaultSocketClusterOptions](#defaultsocketclusteroptions-object)_ | Configuration properties for the socket cluster connection. Supports any options for [SocketCluster v14](https://www.socketcluster.io/docs/14.4.2/api-socketcluster-client/) |
| handlers | object | | A collection of handler functions which will override the defaults. See below for the available handler functions |
| handlers.onError | function | [index.js](./index.js) | Fired when an error is thrown from the underlying socket cluster instance. |
| handlers.onLogin | function | [index.js](./index.js) | A required handler for authenticating with the HarperDB cluster server. The second argument of the function must be called with `(null, { username: '', password: '' })` |
| handlers.onConnect | function | [index.js](./index.js) | Fired when the client connects to the server instance. Does not guarrantee authentication success. |

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