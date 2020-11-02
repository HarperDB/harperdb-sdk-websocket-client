<a name="HarperDBWebSocketClient"></a>

## HarperDBWebSocketClient
**Kind**: global class  

* [HarperDBWebSocketClient](#HarperDBWebSocketClient)
    * [new HarperDBWebSocketClient(options)](#new_HarperDBWebSocketClient_new)
    * [.init()](#HarperDBWebSocketClient+init)
    * [.insert(channel, records)](#HarperDBWebSocketClient+insert)
    * [.update(channel, records)](#HarperDBWebSocketClient+update)
    * [.delete(channel, hashes)](#HarperDBWebSocketClient+delete)
    * [.subscribe(channel, handler)](#HarperDBWebSocketClient+subscribe)
    * [._createPayload(transaction, schema, table)](#HarperDBWebSocketClient+_createPayload)
    * [._onError(err)](#HarperDBWebSocketClient+_onError)
    * [._onLogin(data, res)](#HarperDBWebSocketClient+_onLogin)
    * [._onConnect(data, res)](#HarperDBWebSocketClient+_onConnect)
    * [._validate(channel, records)](#HarperDBWebSocketClient+_validate)

<a name="new_HarperDBWebSocketClient_new"></a>

### new HarperDBWebSocketClient(options)
The constructor initializes the client with options.


| Param | Type |
| --- | --- |
| options | <code>Object</code> | 
| options.rejectUnauthorized | <code>boolean</code> | 
| options.autoConnect | <code>boolean</code> | 
| options.secure | <code>boolean</code> | 
| options.connectTimeout | <code>int</code> | 
| options.ackTimeout | <code>int</code> | 
| options.autoReconnectOptions | <code>object</code> | 

<a name="HarperDBWebSocketClient+init"></a>

### harperDBWebSocketClient.init()
initializes the client.

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  
<a name="HarperDBWebSocketClient+insert"></a>

### harperDBWebSocketClient.insert(channel, records)
inserts data via websocket

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  
**Access**: public  

| Param | Description |
| --- | --- |
| channel | string |
| records | array |

<a name="HarperDBWebSocketClient+update"></a>

### harperDBWebSocketClient.update(channel, records)
updates data via websocket

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  
**Access**: public  

| Param | Description |
| --- | --- |
| channel | string |
| records | array |

<a name="HarperDBWebSocketClient+delete"></a>

### harperDBWebSocketClient.delete(channel, hashes)
deletes data via websocket

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  
**Access**: public  

| Param | Description |
| --- | --- |
| channel | string |
| hashes | array |

<a name="HarperDBWebSocketClient+subscribe"></a>

### harperDBWebSocketClient.subscribe(channel, handler)
subscribes to channel websocket

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  

| Param | Description |
| --- | --- |
| channel | string |
| handler | object |

<a name="HarperDBWebSocketClient+_createPayload"></a>

### harperDBWebSocketClient.\_createPayload(transaction, schema, table)
_createPayload

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  
**Access**: package  

| Param | Description |
| --- | --- |
| transaction | object |
| schema | string |
| table | string |

<a name="HarperDBWebSocketClient+_onError"></a>

### harperDBWebSocketClient.\_onError(err)
_onError handler

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  
**Access**: package  

| Param | Description |
| --- | --- |
| err | object |

<a name="HarperDBWebSocketClient+_onLogin"></a>

### harperDBWebSocketClient.\_onLogin(data, res)
_onLogin handler

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  
**Access**: package  

| Param | Description |
| --- | --- |
| data | object |
| res | object |

<a name="HarperDBWebSocketClient+_onConnect"></a>

### harperDBWebSocketClient.\_onConnect(data, res)
_onConnect handler

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  
**Access**: package  

| Param | Description |
| --- | --- |
| data | object |
| res | object |

<a name="HarperDBWebSocketClient+_validate"></a>

### harperDBWebSocketClient.\_validate(channel, records)
_validate handler

**Kind**: instance method of [<code>HarperDBWebSocketClient</code>](#HarperDBWebSocketClient)  
**Throws**:

- if state is not a valid state

**Access**: package  

| Param | Description |
| --- | --- |
| channel | string |
| records | array |

