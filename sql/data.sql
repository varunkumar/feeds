SET DATABASE = ArcConnect;
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
INSERT INTO post(content, userHandle, startTime) values ('This is a test', 'nagarajv', current_timestamp()) RETURNING id; #168845775817375745
INSERT INTO post(content, userHandle, startTime, linkedPostId, path) values ('@nagarajv #ack #test', 'baigm', current_timestamp(), 168845775817375745, '[168845775817375745]') RETURNING id; #168845914372734977
INSERT INTO post(content, userHandle, startTime, linkedPostId, path) values ('Hello', 'gundasr', current_timestamp(), 168845775817375745, '[168845775817375745]');
INSERT INTO post(content, userHandle, startTime, linkedPostId, path) values ('Thanks for the ack', 'nagarajv', current_timestamp(), 168845914372734977, '[168845775817375745, 168845914372734977]') RETURNING id;

# like
INSERT INTO "like"(postId, userHandle, timestamp) values (168845775817375745, 'baigm', current_timestamp());
INSERT INTO "like"(postId, userHandle, timestamp) values (168845775817375745, 'nagarajv', current_timestamp());

# mention
INSERT INTO mention(postId, userHandle) values (168845914372734977, 'nagarajv');

# hashtag
INSERT INTO hashtag(postId, hashtag) values (168845775817375745, 'test');
INSERT INTO hashtag(postId, hashtag) values (168845914372734977, 'ack');
INSERT INTO hashtag(postId, hashtag) values (168845914372734977, 'test');

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
  WHERE parent.id = 168845914372734977
  ORDER by ago DESC;

# get parent thread - use parsed data from lineage column
SELECT *
  FROM post 
  WHERE id in (168845775817375745, 168845914372734977);

# unlike
DELETE FROM "like" WHERE postId = 168845775817375745 AND userHandle = 'nagarajv'

# plugins
INSERT INTO Plugin (name, source) values ('core', 'Core');
INSERT INTO Plugin (name, source) values ('eureka', 'Eureka');
INSERT INTO Plugin (name, source) values ('food please', 'Food please!');
INSERT INTO Plugin (name, source) values ('arc platform', 'Arc Platform');
INSERT INTO Plugin (name, source) values ('wiki', 'Confluence Wiki');
INSERT INTO Plugin (name, source) values ('commander', 'Commander');

INSERT INTO VoiceLog (userHandle, plugin, response, timestamp) VALUES ('nagarajv', 'core', '[{"subject":"user","utterance":"hi this is a test"},{"subject":"plugin","utterance":{"voice":"Test success","html":"Test success"}}]', current_timestamp);

SELECT * FROM VoiceLog WHERE userHandle = 'nagarajv' LIMIT 10;

http://localhost:3000/mbp/getFeedThread?id=168845914372734977&parentId=[%22168845775817375745%22]