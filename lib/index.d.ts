declare namespace HarperDBWebSocketClient {
  interface Options {
    throwOnSocketClusterError?: boolean;
    debug?: boolean;
    socketClusterOptions?: Record<string, unknown>;
    handlers?: {
      onError: onError;
      onLogin: onLogin;
      onConnect: onConnect;
    };
    implicitInit?: boolean;
    hostname: string;
    port: number;
    username: string;
    password: string;
  }

  interface onError {
    (err?: Error): void;
  }

  interface onLogin {
    (data: any, res: (err: Error | null, credentials: { username: string; password: string }) => void): void;
  }

  interface onConnect {
    (data: any, res: (err: Error | null) => void): void;
  }

  interface Payload {
    hdb_header: { __data_source: number };
    type: string;
    schema: string;
    table: string;
    __originator: { [k: string]: number };
    transaction: Record<string, unknown>;
  }
}

declare class HarperDBWebSocketClient {
  /**
   * HarperDBWebSocketClient is powered by SocketCluster v14.
   * Access the underlying websocket using the `socket` property on the class instance.
   * */
  constructor(options: HarperDBWebSocketClient.Options);

  socket: any; // fill in with types of SocketCluster v14
  options: HarperDBWebSocketClient.Options;
  defaultSocketClusterOptions: Record<string, unknown>;

  init(): void;

  private onError: HarperDBWebSocketClient.onError;
  private onLogin: HarperDBWebSocketClient.onLogin;
  private onConnect: HarperDBWebSocketClient.onConnect;

  /** Wraps a HarperDB transaction into a clustering transaction object which will be understood to process in HarperDB */
  private createPayload(transaction, schema, table): HarperDBWebSocketClient.Payload;
  /** Validates the data attempting to be published to HarperDB */
  private validate(channel: string, records: Record<string, unknown>[]): [string, string];

  /** Publishes an insert operation to a HarperDB channel */
  insert(channel: string, records: Record<string, unknown>[]): void;
  /** Publishes an update operation to a HarperDB channel */
  update(channel: string, records: Record<string, unknown>[]): void;
  /** Publishes a delete operation to a HarperDB channel */
  delete(channel: string, records: Record<string, unknown>[]): void;
  /** Subscribes to a websocket channel. HarperDB uses `schema:table` for its channel names */
  subscribe(channel: string, handler: any): void;
}

export = HarperDBWebSocketClient;
