const connectionConfig = {
  user: 'maxroach',
  host: 'localhost',
  database: 'arcconnect',
  port: 26257
};

// Require the driver.
const pg = require('pg');

let connection;

function getConnection(callback) {
  if (connection) {
    callback(null, connection);
  } else {
    pg.connect(connectionConfig, (err, clientObj, done) => {
      if (err) {
        console.error('Could not connect to cockroachdb', err);
        callback(err);
        done();
      } else {
        connection = clientObj;
        callback(err, connection);
      }
    });
  }
}

module.exports = {
  getConnection
};
