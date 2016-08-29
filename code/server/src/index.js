const express = require('express');
const app = express();
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

app.use(express.static('static'));

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
  console.log(feed);
  mbpClient.postFeed(feed, respond(req, res));
});

app.get('/mbp/getFeeds', (req, res) => {
  console.log(JSON.parse(req.query.filter));
  mbpClient.getFeeds(JSON.parse(req.query.filter), respond(req, res));
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

app.get('/startApp', (req, res) => {
  const spawn = require('child_process').spawn,
    grunt = spawn('grunt', ['serve'], {
      cwd: '/u/nagarajv/projects/reporting-infra/code/frontend'
    })
  let port = 3000;

  grunt.stdout.on('data', data => {
    const match = data.toString().match(/Started connect web server on (.*):(.*)/);
    if (match) {
      port = match[2];
      res.json({
        success: true,
        port: port
      });
    }
    console.log(`stdout: ${data}`);
  });

  grunt.stderr.on('data', data => {
    console.log(`stderr: ${data}`);
  });

  grunt.on('close', code => {
    res.json({
      success: true,
      port: port
    });
  });
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
