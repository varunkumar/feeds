let feedStream = null;

const mbpDao = require('../dao/micro-blog-post-dao.js');

const pushToStreamAndRespond = callback => (err, response) => {
  if (err) {
    callback(err);
  } else {
    if (feedStream) {
      feedStream.write(response);
    }
    callback(err, response);
  }
};

function getFeedStream(call) {
  feedStream = call;
}

function postFeed(call, callback) {
  const feed = call.request;
  mbpDao.postFeed(feed, pushToStreamAndRespond(callback));
}

function getFeeds(call, callback) {
  const filter = call.request;
  mbpDao.getFeeds(filter, callback);
}

function getFeedThread(call, callback) {
  const request = call.request;
  const filter = {
    id: [request.id].concat(request.parentId)
  };
  mbpDao.getFeeds(filter, (err, response) => {
    if (err) {
      callback(err);
    } else {
      const ancestors = response.feed;
      filter.id = [request.id];
      filter.getAllReplies = true;
      mbpDao.getFeeds(filter, (repliesErr, repliesResponse) => {
        if (repliesErr) {
          callback(repliesErr);
        } else {
          const replies = repliesResponse.feed;
          callback(null, {
            replies,
            ancestors
          });
        }
      });
    }
  });
}

function likeFeed(call, callback) {
  const feedAction = call.request;
  mbpDao.likeFeed(feedAction, callback);
}

function unlikeFeed(call, callback) {
  const feedAction = call.request;
  mbpDao.unlikeFeed(feedAction, callback);
}

function follow(call, callback) {
  const request = call.request;
  mbpDao.follow(request, callback);
}

function unfollow(call, callback) {
  const request = call.request;
  mbpDao.unfollow(request, callback);
}

function isFollowing(call, callback) {
  const request = call.request;
  mbpDao.isFollowing(request, callback);
}

module.exports = {
  getFeedStream,
  getFeeds,
  getFeedThread,
  postFeed,
  likeFeed,
  unlikeFeed,
  follow,
  unfollow,
  isFollowing
};
