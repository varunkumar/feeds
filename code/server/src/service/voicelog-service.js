const vlDao = require('../dao/voicelog-dao.js');

function postVoiceLog(call, callback) {
  const voicelog = call.request;
  vlDao.postVoiceLog(voicelog, callback);
}

function getVoiceLogs(call, callback) {
  const voiceLogRequest = call.request;
  vlDao.getVoiceLogs(voiceLogRequest.userHandle, callback);
}

module.exports = {
  postVoiceLog,
  getVoiceLogs
};
