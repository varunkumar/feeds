# users
INSERT INTO "user"(handle, name) values ('nagarajv', 'Varunkumar Nagarajan');
INSERT INTO "user"(handle, name) values ('gundasr', 'Sreekanth Gunda');
INSERT INTO "user"(handle, name) values ('baigm', 'Mukarram Baig');

# followers
INSERT INTO follower(targetHandle, userHandle, startTime, endTime) values ('baigm', 'nagarajv', current_timestamp(), null);
INSERT INTO follower(targetHandle, userHandle, startTime, endTime) values ('gundasr', 'nagarajv', current_timestamp(), null);
INSERT INTO follower(targetHandle, userHandle, startTime, endTime) values ('gundasr', 'baigm', current_timestamp(), null);
INSERT INTO follower(targetHandle, userHandle, startTime, endTime) values ('nagarajv', 'baigm', current_timestamp(), null);

# post
INSERT INTO post(content, userHandle, startTime) values ('This is a test', 'nagarajv', current_timestamp()) RETURNING id;
INSERT INTO post(content, userHandle, startTime, linkedPostId, path) values ('@nagarajv #ack #test', 'baigm', current_timestamp(), 163219294118215681, '[163219294118215681]') RETURNING id;
INSERT INTO post(content, userHandle, startTime, linkedPostId, path) values ('Hello', 'gundasr', current_timestamp(), 163219294118215681, '[163219294118215681]') RETURNING id;
INSERT INTO post(content, userHandle, startTime, linkedPostId, path) values ('Thanks for the ack', 'nagarajv', current_timestamp(), 163219378699993089, '[163219294118215681, 163219378699993089]') RETURNING id;

# like
INSERT INTO "like"(postId, userHandle, timestamp) values (163219294118215681, 'baigm', current_timestamp());
INSERT INTO "like"(postId, userHandle, timestamp) values (163219294118215681, 'nagarajv', current_timestamp());

# mention
INSERT INTO mention(postId, userHandle) values (163219378699993089, 'nagarajv');

# hashtag
INSERT INTO hashtag(postId, hashtag) values (163219294118215681, 'test');
INSERT INTO hashtag(postId, hashtag) values (163219378699993089, 'ack');
INSERT INTO hashtag(postId, hashtag) values (163219378699993089, 'test');

# owner feeds
SELECT * 
  FROM post p
  WHERE p.userHandle = 'nagarajv'
    AND p.endTime is NULL;

# follower feeds
SELECT * 
  FROM post p
  JOIN follower f
    ON p.userHandle = f.targetHandle
  WHERE f.userHandle = 'nagarajv'
    AND p.endTime is NULL
    AND f.endTime is NULL;

# mention feeds
SELECT * 
  FROM post p
  JOIN mention m
    ON p.id = m.postId
  WHERE m.userHandle = 'nagarajv'
    AND p.endTime is NULL;

# hashtag feeds
SELECT *
  FROM post p
  JOIN hashtag h
    ON p.id = h.postId
  WHERE h.hashtag = 'test'
    AND p.endTime is NULL;

# unfollow
UPDATE follower
  SET endTime = current_timestamp()
  WHERE targetHandle = 'baigm'
    AND userHandle = 'nagarajv'
    AND endTime is NULL;

# isfollowing
SELECT *
  FROM follower
  WHERE targetHandle = 'baigm'
    AND userHandle = 'nagarajv'
    AND endTime is null;

# get immediate replies
SELECT reply.*, age(reply.startTime) as ago
  FROM post parent
  JOIN post reply
    ON parent.id = reply.linkedPostId
  WHERE parent.id = 163219378699993089
  ORDER by ago DESC;

# get parent thread - use parsed data from lineage column
SELECT *
  FROM post 
  WHERE id in (163219294118215681, 163219378699993089);

# unlike
DELETE FROM "like" WHERE postId = 163219294118215681 AND userHandle = 'nagarajv'

http://localhost:3000/mbp/getFeedThread?id=163219378699993089&parentId=[%22163219294118215681%22]