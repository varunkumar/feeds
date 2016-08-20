CockroachDB setup
-----------------
- Download & install CockroachDB from [CockroachDBLabs](https://www.cockroachlabs.com/docs/install-cockroachdb.html) (Tested with version beta-20160728 on Mac OSX and Linux)
- Extract the cockroach binary and make sure it is available in the path
- Start a cluster of three nodes:

```
cockroach start --background --http-port=8080
cockroach start --store=node2 --port=26258 --http-port=8081 --join=localhost:26257 --background
cockroach start --store=node3 --port=26259 --http-port=8082 --join=localhost:26257 --background
```
- Stop nodes:
```
cockroach quit
cockroach quit --port=26258
cockroach quit --port=26259
```
- Status of nodes: `cockroach node status`
- Execute a query:
```
cockroach sql --database=ArcConnect --user=maxroach
```