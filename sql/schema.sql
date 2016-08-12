CREATE DATABASE ArcConnect;
GRANT ALL ON DATABASE ArcConnect TO maxroach;

SET DATABASE = ArcConnect;

CREATE TABLE "User" (
  "handle" STRING(8) NOT NULL,
  "name" STRING(150) NOT NULL UNIQUE,
  CONSTRAINT pkUser PRIMARY KEY ("handle")
);

CREATE TABLE "Follower" (
  "targetHandle" STRING(8) NOT NULL,
  "userHandle" STRING(8) NOT NULL,
  "startTime" timestamp NOT NULL,
  "endTime" timestamp
);

CREATE TABLE "Post" (
  "id" SERIAL NOT NULL,
  "content" STRING(140) NOT NULL,
  "userHandle" STRING(8) NOT NULL,
  "startTime" timestamp NOT NULL,
  "endTime" timestamp,
  "linkedPostId" INT NULL,
  "path" text NULL,
  CONSTRAINT pkPost PRIMARY KEY ("id")
);

CREATE TABLE "Like" (
  "postId" INT NOT NULL,
  "userHandle" STRING(8) NOT NULL,
  "timestamp" timestamp NOT NULL
);

CREATE TABLE "Mention" (
  "postId" INT NOT NULL,
  "userHandle" STRING(8) NOT NULL
);

CREATE TABLE "Hashtag" (
  "postId" INT NOT NULL,
  "hashTag" STRING(139) NOT NULL
);

CREATE TABLE "VoiceLog" (
  "id" SERIAL NOT NULL,
  "userHandle" STRING(8) NOT NULL,
  "transcription" STRING(400) NOT NULL,
  "pluginId" integer NOT NULL,
  "status" STRING(20) NOT NULL,
  "response" STRING(1024) NOT NULL,
  "timestamp" timestamp NOT NULL,
  CONSTRAINT pkVoiceLogs PRIMARY KEY ("id")
);

CREATE TABLE "Plugin" (
  "id" SERIAL NOT NULL,
  "name" STRING(20) NOT NULL,
  "source" STRING(200) NOT NULL,
  CONSTRAINT pkPlugin PRIMARY KEY ("id")
);

ALTER TABLE "Follower" ADD CONSTRAINT "fkFollowerTargetHandle" FOREIGN KEY ("targetHandle") REFERENCES "User"("handle");
ALTER TABLE "Follower" ADD CONSTRAINT "fkFollowerUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle");

ALTER TABLE "Post" ADD CONSTRAINT "fkPostUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle");
ALTER TABLE "Post" ADD CONSTRAINT "fkPostLinkedPostId" FOREIGN KEY ("linkedPostId") REFERENCES "Post"("id");

ALTER TABLE "Like" ADD CONSTRAINT "fkLikePostId" FOREIGN KEY ("postId") REFERENCES "Post"("id");
ALTER TABLE "Like" ADD CONSTRAINT "fkLkeUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle");

ALTER TABLE "Mention" ADD CONSTRAINT "fkMentionPostId" FOREIGN KEY ("postId") REFERENCES "Post"("id");
ALTER TABLE "Mention" ADD CONSTRAINT "fkMentionUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle");

ALTER TABLE "Hashtag" ADD CONSTRAINT "fkHashtagPostId" FOREIGN KEY ("postId") REFERENCES "Post"("id");

ALTER TABLE "VoiceLog" ADD CONSTRAINT "fkVoiceLogUserHandle" FOREIGN KEY ("userHandle") REFERENCES "User"("handle");
ALTER TABLE "VoiceLog" ADD CONSTRAINT "fkVoiceLogPluginId" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id");