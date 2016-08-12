const PROTO_PATH = `${__dirname}/mbp.proto`;

const grpc = require('grpc');
const mbpProto = grpc.load(PROTO_PATH).microblog;

const mbpService = new mbpProto.MicroBlogPostService('localhost:50051', grpc.credentials.createInsecure());

const sockets = {};

const pushToStreamAndRespond = (callback, action) => (err, response) => {
  if (err) {
    callback(err);
  } else {
    Object.keys(sockets).map(socketInfo => sockets[socketInfo].emit(action, response.feed));
    callback(err, response);
  }
};

function setupFeedStream() {
  const feedStream = mbpService.getFeedStream();
  feedStream.on('data', response => {
    Object.keys(sockets).map(socketInfo => sockets[socketInfo].emit('feed:new', response.feed));
  });
  feedStream.on('end', () => console.log('Done'));
  feedStream.on('status', status => console.log('Status', status));
}
setupFeedStream();

function addSocket(socket, socketInfo) {
  sockets[socketInfo] = socket;
}

function removeSocket(socketInfo) {
  delete sockets[socketInfo];
}

function getFeeds(filter, callback) {
  mbpService.getFeeds(filter, callback);
}

function getFeedThread(feedThreadRequest, callback) {
  mbpService.getFeedThread(feedThreadRequest, callback);
}

function postFeed(feed, callback) {
  mbpService.postFeed(feed, callback);
}

function likeFeed(feedAction, callback) {
  mbpService.likeFeed(feedAction, pushToStreamAndRespond(callback, 'feed:like'));
}

function unlikeFeed(feedAction, callback) {
  mbpService.unlikeFeed(feedAction, pushToStreamAndRespond(callback, 'feed:like'));
}

function follow(friendRequest, callback) {
  mbpService.follow(friendRequest, callback);
}

function unfollow(friendRequest, callback) {
  mbpService.unfollow(friendRequest, callback);
}

function isFollowing(friendRequest, callback) {
  mbpService.isFollowing(friendRequest, callback);
}

module.exports = {
  getFeeds,
  getFeedThread,
  postFeed,
  addSocket,
  removeSocket,
  likeFeed,
  unlikeFeed,
  follow,
  unfollow,
  isFollowing
};
