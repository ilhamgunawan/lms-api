import { QueryResult, Client } from 'pg';
import { makeLog } from '../utils/utils';

const DATABASE_URL = process.env.DATABASE_URL;

export const client = new Client({
  connectionString: DATABASE_URL
});

// const pool = new Pool({
//   connectionString: DATABASE_URL
// });

export type Callback = (err: Error, res: QueryResult) => void;

function init() {
  client.connect()
    .then(() => makeLog('db-connection', 'success', true))
    .catch((e: Error) => makeLog('db-connection', e.stack ? e.stack : e, true));
}

const db = {
  // query: (text: string, params: Array<string>, callback: Callback) => {
  //   const start = Date.now();
  //   return pool.query(text, params, (err, res) => {
  //     const duration = Date.now() - start
  //     console.log('executed query', { text, duration, res: res })
  //     callback(err, res)
  //   });
  // },
  query: (query: string, params: Array<string>, callback: Callback) => {
    const start = Date.now();
    return client.query(query, params, (err, res) => {
      const duration = Date.now() - start;
      makeLog('executed query', JSON.stringify({ query, duration }));
      callback(err, res);
    });
  },
  queryPromise: (query: string, params: Array<string>) => {
    return new Promise<QueryResult>((resolve, reject) => {
      const start = Date.now();
      client.query(query, params, (err, res) => {
        const duration = `${Date.now() - start}ms`;
        if (err) {
          makeLog('db-query', { status: 'failure', error: err.stack, query, params, duration }, true);
          reject(err);
        } else {
          makeLog('db-query', { status: 'success', query, params, duration }, true);
          resolve(res);
        }
      });
    })
  },
  init: init,
};

export default db;
