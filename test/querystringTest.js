import test from "ava";
import { EleventyEdge } from "../dist/edge@2.0.0/eleventy-edge.cjs";

// https://github.com/11ty/eleventy/issues/2422
test("Duplicate query string params test, 11ty/eleventy #2422 ", async t => {
  let edge = new EleventyEdge("test1", {
    request: {
      url: "http://localhost/?a=1&b=1&b=2",
      method: "get",
      headers: {
        get: function() {}
      }
    }
  });
  let data = await edge.getEdgeData();

  t.deepEqual(data.eleventy.edge.query, {
    a: "1",
    b: ["1", "2"]
  });
});