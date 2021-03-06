'use strict';

const socketcluster = require('socketcluster-client');

const defaultSocketClusterOptions = {
  rejectUnauthorized: false,
  autoConnect: true,
  secure: true,
  connectTimeout: 100000,
  ackTimeout: 10000,
  autoReconnectOptions: {
    initialDelay: 1000,
    maxDelay: 2000,
  },
};

class HarperDBWebSocketClient {
  /**
   * The constructor initializes the client with options.
   * @constructor
   * @param {Object} options
   * @param {boolean} options.rejectUnauthorized
   * @param {boolean} options.autoConnect
   * @param {boolean} options.secure
   * @param {int} options.connectTimeout
   * @param {int} options.ackTimeout
   * @param {object} options.autoReconnectOptions
   */
  constructor(options) {
    this.options = options;

    if (!options.debug) {
      this.options.debug = process.env.NODE_ENV === 'development';
    }

    if (!options.socketClusterOptions) {
      this.options.socketClusterOptions = defaultSocketClusterOptions;
    }

    if (options.implicitInit) {
      this.init();
    }
  }

  /**
   * initializes the client.
   * @function
   */

  init() {
    if (this.initialized) {
      throw Error('init method already called by constructor due do option `implicitInit`');
    }

    this.socket = socketcluster.create({
      hostname: this.options.hostname,
      port: this.options.port,
      ...this.options.socketClusterOptions,
    });

    this.socket.on(
      'error',
      this.options.handlers && Object.prototype.hasOwnProperty.call(this.options.handlers, 'onError')
        ? this.options.handlers.onError.bind(this)
        : this._onError.bind(this)
    );
    this.socket.on(
      'login',
      this.options.handlers && Object.prototype.hasOwnProperty.call(this.options.handlers, 'onLogin')
        ? this.options.handlers.onLogin.bind(this)
        : this._onLogin.bind(this)
    );
    this.socket.on(
      'connect',
      this.options.handlers && Object.prototype.hasOwnProperty.call(this.options.handlers, 'onConnect')
        ? this.options.handlers.onConnect.bind(this)
        : this._onConnect.bind(this)
    );

    this.initialized = true;
  }

  /**
   * inserts data via websocket
   * @function
   * @public
   * @param channel string
   * @param records array
   */

  insert(channel, records) {
    const [schema, table] = this._validate(channel, records);
    const transaction = {
      operation: 'insert',
      schema: schema,
      table: table,
      records: records,
    };
    const payload = this._createPayload(transaction, schema, table);
    if (this.options.debug) {
      console.log(`publishing insert event on channel ${channel} with `, payload);
    }
    this.socket.publish(channel, payload);
  }

  /**
   * updates data via websocket
   * @function
   * @public
   * @param channel string
   * @param records array
   */

  update(channel, records) {
    const [schema, table] = this._validate(channel, records);
    const transaction = {
      operation: 'update',
      schema: schema,
      table: table,
      records: records,
    };
    const payload = this._createPayload(transaction, schema, table);
    if (this.options.debug) {
      console.log(`publishing update event on channel ${channel} with `, payload);
    }
    this.socket.publish(channel, payload);
  }

  /**
   * deletes data via websocket
   * @function
   * @public
   * @param channel string
   * @param hashes array
   */

  delete(channel, hashes) {
    const [schema, table] = this._validate(channel, hashes);
    const transaction = {
      operation: 'delete',
      schema: schema,
      table: table,
      hash_values: hashes,
    };
    const payload = this._createPayload(transaction, schema, table);
    if (this.options.debug) {
      console.log(`publishing delete event on channel ${channel} with `, payload);
    }
    this.socket.publish(channel, payload);
  }

  /**
   * subscribes to channel websocket
   * @function
   * @param channel string
   * @param handler object
   */
  subscribe(channel, handler) {
    this.socket.subscribe(channel).watch(handler);
  }

  /**
   * _createPayload
   * @function
   * @package
   * @param transaction object
   * @param schema string
   * @param table string
   */
  _createPayload(transaction, schema, table) {
    return {
      hdb_header: { __data_source: 6 },
      type: 'HDB_TRANSACTION',
      schema: schema,
      table: table,
      __originator: { [this.socket.id]: 111 },
      transaction: transaction,
    };
  }

  /**
   * _onError handler
   * @param err object
   * @package
   */
  _onError(err) {
    if (this.options.throwOnSocketClusterError) {
      throw err;
    } else if (this.options.debug) {
      console.error('error: ', err);
    }
  }

  /**
   * _onLogin handler
   * @param data object
   * @param res object
   * @package
   */
  _onLogin(data, res) {
    if (this.options.debug) {
      console.log('logged in');
    }

    res(null, {
      username: this.options.username,
      password: this.options.password,
    });
  }

  /**
   * _onConnect handler
   * @param data object
   * @param res object
   * @package
   */
  _onConnect(data, res) {
    if (this.options.debug) {
      console.log('connected');
    }
  }

  /**
   * _validate handler
   * @param channel string
   * @param records array
   * @throws if state is not a valid state
   * @package
   */
  _validate(channel, records) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('records must be an array with at least one entry');
    }
    const schemaTable = channel.split(':');
    if (schemaTable.length !== 2) {
      throw new Error('invalid channel name');
    }
    return schemaTable;
  }
}

HarperDBWebSocketClient.defaultSocketClusterOptions = defaultSocketClusterOptions;

module.exports = HarperDBWebSocketClient;
