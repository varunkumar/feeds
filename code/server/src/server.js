const MBP_PROTO_PATH = `${__dirname}/mbp.proto`;
const VL_PROTO_PATH = `${__dirname}/voicelogs.proto`;

const grpc = require('grpc');
const mbpProto = grpc.load(MBP_PROTO_PATH).microblog;
const vlProto = grpc.load(VL_PROTO_PATH).voiceLog;

const microBlogPostService = require('./service/micro-blog-post-service.js');
const voiceLogService = require('./service/voicelog-service.js');

function main() {
  const server = new grpc.Server();
  server.addProtoService(mbpProto.MicroBlogPostService.service, microBlogPostService);
  server.addProtoService(vlProto.VoiceLogService.service, voiceLogService);
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
