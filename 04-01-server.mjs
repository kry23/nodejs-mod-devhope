import { createServer } from "node:http";

const server = createServer((request, response) => {
  console.log("request received");

  response.statusCode = 200;

  response.setHeader("Content-Type", "text/html");
 const myMessage = "I change here";
  response.end(
    `<html><body><h1>${myMessage}</h1></body></html>`
  );
});

server.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});
