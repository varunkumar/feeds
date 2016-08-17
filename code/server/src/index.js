const app = require('express')();
const http = require('http').Server(app); // eslint-disable-line
const io = require('socket.io')(http);
const mbpClient = require('./client');

const respond = (req, res) => (err, response) => {
  if (err) {
    res.status(500).send(err);
  } else {
    res.json(response);
  }
};

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.get('/mbp/post', (req, res) => {
  const feed = {
    content: req.query.content,
    userHandle: req.query.userHandle,
    linkedPostId: req.query.linkedPostId,
    path: req.query.path
  };
  mbpClient.postFeed(feed, respond(req, res));
});

app.get('/mbp/getFeeds', (req, res) => {
  mbpClient.getFeeds({}, respond(req, res));
});

app.get('/mbp/getFeedThread', (req, res) => {
  console.log(JSON.parse(req.query.parentId));
  mbpClient.getFeedThread({
    id: req.query.id,
    parentId: JSON.parse(req.query.parentId)
  }, respond(req, res));
});

app.get('/mbp/likeFeed', (req, res) => {
  const feedAction = {
    id: req.query.id,
    userHandle: req.query.userHandle
  };
  mbpClient.likeFeed(feedAction, respond(req, res));
});

app.get('/mbp/unlikeFeed', (req, res) => {
  const feedAction = {
    id: req.query.id,
    userHandle: req.query.userHandle
  };
  mbpClient.unlikeFeed(feedAction, respond(req, res));
});

app.get('/mbp/follow', (req, res) => {
  const friendRequest = {
    targetHandle: req.query.targetHandle,
    userHandle: req.query.userHandle
  };
  mbpClient.follow(friendRequest, respond(req, res));
});

app.get('/mbp/unfollow', (req, res) => {
  const friendRequest = {
    targetHandle: req.query.targetHandle,
    userHandle: req.query.userHandle
  };
  mbpClient.unfollow(friendRequest, respond(req, res));
});

app.get('/mbp/isfollowing', (req, res) => {
  const friendRequest = {
    targetHandle: req.query.targetHandle,
    userHandle: req.query.userHandle
  };
  mbpClient.isFollowing(friendRequest, respond(req, res));
});

io.on('connection', (socket) => {
  let socketInfo;
  socket.on('disconnect', () => {
    mbpClient.removeSocket(socketInfo);
  });
  socket.on('init', (e) => {
    socketInfo = e;
    mbpClient.addSocket(socket, e);
  });
});

http.listen(5000, () => {
  console.log('listening on *:5000');
});
