const fs = require("fs");
const shst = require("sharedstreets");
const level = require("level");
const rimraf = require("rimraf");
const turf = require("@turf/turf");
const ss = require("simple-statistics");

async function run() {
  const trips = fs
    .readFileSync("./trips.json")
    .toString()
    .split("\n")
    .filter(d => {
      return d.length;
    })
    .map(JSON.parse);

  var edges = {};
  const envelope = turf.bboxPolygon([
    -86.79611206054688,
    36.14612299393171,
    -86.7575740814209,
    36.17460406472864
  ]).geometry;

  const graphOpts = {
    source: "osm/planet-181224",
    tileHierarchy: 6
  };
  var graph = new shst.Graph(envelope, graphOpts);
  await graph.buildGraph();
  var k = 0;
  for (let trip of trips) {
    const coordinates = trip.route.features.map(f => {
      return f.geometry.coordinates;
    });
    const line = turf.lineString(coordinates);

    const match = await graph.matchTrace(line);
    if (match && match.matchedPath) {
      var segments = [];

      var i = 0;
      for (let segment of match.segments) {
        var part = turf.lineString(match.matchedPath.geometry.coordinates[i], {
          geometryId: segment.geometryId,
          adjacent: {}
        });
        segments.push(part);

        i++;
      }

      for (let segment of segments) {
        var record = edges[segment.properties.geometryId];

        if (record) {
          segment = record;
        }

        for (let adjacent of segments) {
          if (!segment.properties.adjacent[adjacent.properties.geometryId]) {
            segment.properties.adjacent[adjacent.properties.geometryId] = 1;
          } else {
            segment.properties.adjacent[adjacent.properties.geometryId]++;
          }
        }

        edges[segment.properties.geometryId] = segment;
      }
    }
  }

  fs.writeFileSync("./edges.json", JSON.stringify(edges));
}

run();
