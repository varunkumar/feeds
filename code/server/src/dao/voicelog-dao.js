let connection;

const connectionUtil = require('./connection-util.js');
connectionUtil.getConnection((err, con) => {
  connection = con;
});

const vlMapper = row => ({
  id: row.id,
  plugin: row.plugin,
  userHandle: row.userHandle,
  timestamp: String(row.timestamp),
  response: row.response
});

function getVoiceLogs(userHandle, callback) {
  if (connection) {
    const query = `SELECT * FROM VoiceLog WHERE userHandle = '${userHandle}' ORDER by timestamp DESC LIMIT 10`;
    console.log(query);
    connection.query(query, (err, results) => {
      if (err) {
        callback(new Error(err.error));
      } else {
        callback(null, results.rows.map(vlMapper));
      }
    });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

function postVoiceLog(voiceLog, callback) {
  if (connection) {
    const query =
      `INSERT INTO VoiceLog (userHandle, plugin, response, timestamp) VALUES 
('${voiceLog.userHandle}', '${voiceLog.plugin}', '${voiceLog.response}', current_timestamp())`;
    console.log(query);
    connection.query(query, (err) => {
      if (err) {
        callback(new Error(err.error));
      } else {
        callback(null, {});
      }
    });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

module.exports = {
  getVoiceLogs,
  postVoiceLog
};
