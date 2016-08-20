CREATE DATABASE ArcConnect;
GRANT ALL ON DATABASE ArcConnect TO maxroach;

SET DATABASE = ArcConnect;

CREATE TABLE "User" (
  "handle" STRING(8) NOT NULL,
  "name" STRING(150) NOT NULL UNIQUE,
  CONSTRAINT "pkUser" PRIMARY KEY ("handle")
);

CREATE TABLE "Follower" (
  "targetHandle" STRING(8) NOT NULL,
  "userHandle" STRING(8) NOT NULL,
  "startTime" timestamp NOT NULL,
  "endTime" timestamp,
  CONSTRAINT "pkFollower" PRIMARY KEY ("targetHandle", "userHandle", "startTime"),
  CONSTRAINT "fkFollowerUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle"),
  INDEX("userHandle")
);

CREATE TABLE "Post" (
  "id" SERIAL NOT NULL,
  "content" STRING(140) NOT NULL,
  "userHandle" STRING(8) NOT NULL,
  "startTime" timestamp NOT NULL,
  "endTime" timestamp,
  "linkedPostId" INT NULL,
  "path" text NULL,
  CONSTRAINT "pkPost" PRIMARY KEY ("id"),
  CONSTRAINT "fkPostUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle"),
  CONSTRAINT "fkPostLinkedPostId" FOREIGN KEY ("linkedPostId") REFERENCES "Post"("id"),
  INDEX("userHandle"),
  INDEX("linkedPostId")
);

CREATE TABLE "Like" (
  "postId" INT NOT NULL,
  "userHandle" STRING(8) NOT NULL,
  "timestamp" timestamp NOT NULL,
  CONSTRAINT "pkLike" PRIMARY KEY ("postId", "userHandle"),
  CONSTRAINT "fkLikePostId" FOREIGN KEY ("postId") REFERENCES "Post"("id"),
  CONSTRAINT "fkLkeUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle"),
  INDEX("postId"),
  INDEX("userHandle")
);

CREATE TABLE "Mention" (
  "postId" INT NOT NULL,
  "userHandle" STRING(8) NOT NULL,
  CONSTRAINT "fkMentionPostId" FOREIGN KEY ("postId") REFERENCES "Post"("id"),
  CONSTRAINT "fkMentionUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle"),
  INDEX("postId"),
  INDEX("userHandle")
);

CREATE TABLE "Hashtag" (
  "postId" INT NOT NULL,
  "hashTag" STRING(139) NOT NULL,
  CONSTRAINT "fkHashtagPostId" FOREIGN KEY ("postId") REFERENCES "Post"("id"),
  INDEX("postId")
);

CREATE TABLE "Plugin" (
  "id" SERIAL NOT NULL,
  "name" STRING(20) NOT NULL,
  "source" STRING(200) NOT NULL,
  CONSTRAINT "pkPlugin" PRIMARY KEY ("id")
);

CREATE TABLE "VoiceLog" (
  "id" SERIAL NOT NULL,
  "userHandle" STRING(8) NOT NULL,
  "transcription" STRING(400) NOT NULL,
  "pluginId" integer NOT NULL,
  "status" STRING(20) NOT NULL,
  "response" STRING(1024) NOT NULL,
  "timestamp" timestamp NOT NULL,
  CONSTRAINT "pkVoiceLogs" PRIMARY KEY ("id"),
  CONSTRAINT "fkVoiceLogUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle"),
  CONSTRAINT "fkVoiceLogPluginId" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id"),
  INDEX("userHandle"),
  INDEX("pluginId")
);

ALTER TABLE "Follower" ADD CONSTRAINT "fkFollowerTargetHandle" FOREIGN KEY ("targetHandle") REFERENCES "User"("handle");

DROP TABLE "VoiceLog";
DROP TABLE "Plugin";
DROP TABLE "Hashtag";
DROP TABLE "Mention";
DROP TABLE "Like";
DROP TABLE "Post";
DROP TABLE "Follower";
DROP TABLE "User";