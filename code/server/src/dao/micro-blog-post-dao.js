let connection;

const connectionUtil = require('./connection-util.js');
connectionUtil.getConnection((err, con) => {
  connection = con;
});

const removeNull = value => (value || undefined);

const feedMapper = row => ({
  id: row.id,
  content: row.content,
  userHandle: row.userHandle,
  startTime: String(row.startTime),
  endTime: removeNull(row.endTime),
  age: String(row.age),
  linkedPostId: removeNull(row.linkedPostId),
  path: removeNull(row.path)
});

const likesMapper = postLikesMap => feed => Object.assign(feed, postLikesMap[feed.id]);

function getLikesForFeeds(postIds, callback) {
  if (connection) {
    connection.query(`SELECT * FROM "like" WHERE postId in (${postIds})`, (err, results) => {
      if (err) {
        callback(err);
      } else {
        const postLikeMap = {};
        results.rows.map(row => {
          postLikeMap[row.postId] = postLikeMap[row.postId] || {
            likesCount: 0,
            likes: []
          };
          postLikeMap[row.postId].likesCount++;
          postLikeMap[row.postId].likes.push(row.userHandle);
          return row;
        });
        callback(null, postLikeMap);
      }
    });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

function enrichFeedsWithLikes(rows, callback) {
  const postIds = rows.map(row => row.id).join(',').replace(/'/g, '');
  if (rows.length === 0) {
    // Nothing to enrich
    callback(null, {
      feed: []
    });
  } else {
    getLikesForFeeds(postIds, (likesErr, likesResults) => {
      if (likesErr) {
        callback(likesErr);
      } else {
        callback(null, {
          feed: rows.map(feedMapper).map(likesMapper(likesResults))
        });
      }
    });
  }
}

function constructQueryFromFilter(filter) {
  let query = 'SELECT *, age(startTime) as age FROM post p';
  if (filter) {
    if (filter.id && filter.id.length >= 1) {
      if (filter.getAllReplies) {
        return `SELECT reply.*, age(reply.startTime) as ago
                  FROM post parent
                  JOIN post reply
                    ON parent.id = reply.linkedPostId
                  WHERE parent.id = ${filter.id[0]}
                  ORDER by ago DESC`;
      }

      if (filter.id.length === 1) {
        query += ` WHERE id = ${filter.id[0]}`;
      } else if (filter.id.length > 1) {
        const ids = filter.id.join(',').replace(/'/g, '');
        query += ` WHERE id in (${ids})`;
      }
    } else if (filter.follower) {
      return `SELECT p.*, age(p.startTime)
                FROM post p
              JOIN follower f
              ON p.userHandle = f.targetHandle
              WHERE f.userHandle = '${filter.userHandle}'
              AND p.endTime is NULL
              AND f.endTime is NULL`;
    } else if (filter.mention) {
      return `SELECT p.*, age(p.startTime) 
                FROM post p
                JOIN mention m
                  ON p.id = m.postId
                WHERE m.userHandle = '${filter.userHandle}'
                  AND p.endTime is NULL`;
    } else if (filter.owner) {
      return `SELECT p.*, age(p.startTime) 
                FROM post p
                WHERE p.userHandle = '${filter.userHandle}'
                  AND p.endTime is NULL`;
    }
  }
  return query;
}

function getFeeds(filter, callback) {
  if (connection) {
    const query = constructQueryFromFilter(filter);
    console.log(filter);
    console.log(query);
    connection.query(query, (err, results) => {
      if (err) {
        callback(err);
      } else {
        enrichFeedsWithLikes(results.rows, callback);
      }
    });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

function postFeed(feed, callback) {
  if (connection) {
    const query =
      `INSERT INTO post(content, userHandle, startTime, linkedPostId, path) values ('${feed.content}', 
'${feed.userHandle}', current_timestamp(), ${feed.linkedPostId || null}, '${feed.path}') RETURNING *`;
    connection.query(query, (err, results) => {
      if (err) {
        callback(err);
      } else {
        callback(null, results.rows.map(feedMapper));
      }
    });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

function removeFeed() {

}

function likeFeed(feedAction, callback) {
  if (connection) {
    const query =
      `INSERT INTO "like"(postId, userHandle, timestamp) values (${feedAction.id}, '${feedAction.userHandle}', 
current_timestamp())`;
    connection.query(query, (err) => {
      if (err) {
        callback(err);
      } else {
        getFeeds({
          id: [feedAction.id]
        }, callback);
      }
    });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

function unlikeFeed(feedAction, callback) {
  if (connection) {
    const query =
      `DELETE FROM "like" WHERE postId = ${feedAction.id} AND userHandle = '${feedAction.userHandle}'`;
    connection.query(query, (err) => {
      if (err) {
        callback(err);
      } else {
        getFeeds({
          id: [feedAction.id]
        }, callback);
      }
    });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

function follow(request, callback) {
  if (connection) {
    connection.query(
      `INSERT INTO follower(targetHandle, userHandle, startTime, endTime) values (
'${request.targetHandle}', '${request.userHandle}', current_timestamp(), null);`,
      (err) => {
        callback(err);
      });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

function unfollow(request, callback) {
  if (connection) {
    connection.query(
      `UPDATE follower SET endTime = current_timestamp() 
WHERE targetHandle = '${request.targetHandle}' AND userHandle = '${request.userHandle}'; AND endTime IS NULL`,
      (err) => {
        callback(err);
      });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

function isFollowing(request, callback) {
  if (connection) {
    connection.query(
      `SELECT * FROM follower 
WHERE targetHandle = '${request.targetHandle}' AND userHandle = '${request.userHandle}' AND endTime IS NULL`,
      (err, results) => {
        if (err) {
          callback(err);
        } else {
          callback(null, {
            targetHandle: request.targetHandle,
            isFollowing: results.rows.length > 0
          });
        }
      });
  } else {
    callback(new Error('Unable to connect to cockroach db'));
  }
}

module.exports = {
  getFeeds,
  postFeed,
  removeFeed,
  likeFeed,
  unlikeFeed,
  follow,
  unfollow,
  isFollowing
};
