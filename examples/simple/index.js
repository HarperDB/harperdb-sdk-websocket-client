import dotenv from 'dotenv';
import axios from 'axios';
import HarperDBWebSocketClient from '../../lib/index.js';

dotenv.config();

const hdb_protocol = process.env.HDB_PROTOCOL;
const hdb_host = process.env.HDB_HOST;
const hdb_port = process.env.HDB_PORT;
const hdb_username = process.env.HDB_USERNAME;
const hdb_password = process.env.HDB_PASSWORD;

const cluster_port = process.env.HDB_CLUSTER_PORT;
const cluster_username = process.env.HDB_CLUSTER_USERNAME;
const cluster_password = process.env.HDB_CLUSTER_PASSWORD;

const hdb_url = `${hdb_protocol}${hdb_host}:${hdb_port}`;
const hdb_auth_string = `Basic ${Buffer.from(`${hdb_username}:${hdb_password}`).toString('base64')}`;

console.log(hdb_url);

const client = new HarperDBWebSocketClient({
  hostname: hdb_host,
  socketClusterOptions: {
    rejectUnauthorized: false,
    autoReconnect: false,
    ackTimeout: 10000,
    secure: true,
  },
  port: cluster_port,
  username: cluster_username,
  password: cluster_password,
  debug: true,
  implicitInit: true,
});

client.subscribe('dev:dog', (arg1, arg2) => {
  console.log(arg1, arg2);
});

const dropSchema = () =>
  axios({
    url: hdb_url,
    method: 'post',
    headers: {
      Authorization: hdb_auth_string,
    },
    data: {
      operation: 'drop_schema',
      schema: 'dev',
    },
  });

const createSchema = () =>
  axios({
    url: hdb_url,
    method: 'post',
    headers: {
      Authorization: hdb_auth_string,
    },
    data: {
      operation: 'create_schema',
      schema: 'dev',
    },
  });

const createTable = () =>
  axios({
    url: hdb_url,
    method: 'post',
    headers: {
      Authorization: hdb_auth_string,
    },
    data: {
      operation: 'create_table',
      schema: 'dev',
      table: 'dog',
      hash_attribute: 'id',
    },
  });

const describeTable = () =>
  axios({
    url: hdb_url,
    method: 'post',
    headers: {
      Authorization: hdb_auth_string,
    },
    data: {
      operation: 'describe_table',
      schema: 'dev',
      table: 'dog',
    },
  });

dropSchema()
  .then(() => createSchema())
  .then(() => createTable())
  .catch((response) => {
    console.log(response);
    /*if (err?.error === "Schema 'dev' does not exist") {
      createSchema().then(() => createTable());
    }*/

    // console.error(err);
  });

setTimeout(() => {
  client.insert('dev:dog', [
    { id: '1', name: 'Harper', breed: 'Mutt' },
    { id: '2', name: 'Penny', breed: 'Mutt' },
  ]);

  setTimeout(() => {
    describeTable()
      .then(({ data }) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, 1000);
}, 1000);
