import { useEffect, useState, useCallback } from 'react';
import './App.css';
import HarperDBWebSocketClient from 'harperdb-websocket-client';

// initialize the client outside the render cycle
const client = new HarperDBWebSocketClient({
  hostname: 'localhost',
  socketClusterOptions: {
    rejectUnauthorized: false,
    autoReconnect: false,
    ackTimeout: 10000,
    secure: true,
  },
  port: 12345,
  username: 'cluster_user',
  password: 'password',
  debug: true,
  implicitInit: true,
});

function App() {
  const [data, setData] = useState([]);

  const addNewRow = useCallback((newDogData) => setData([...data, JSON.stringify(newDogData)]), [setData, data]);

  useEffect(() => client.subscribe('dev:dog', addNewRow), [addNewRow]);

  return data.map((d) => <pre key={d}>{d}</pre>);
}

export default App;
