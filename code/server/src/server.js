const PROTO_PATH = `${__dirname}/mbp.proto`;

const grpc = require('grpc');
const mbpProto = grpc.load(PROTO_PATH).microblog;

const microBlogPostService = require('./service/micro-blog-post-service.js');

function main() {
  const server = new grpc.Server();
  server.addProtoService(mbpProto.MicroBlogPostService.service, microBlogPostService);
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
