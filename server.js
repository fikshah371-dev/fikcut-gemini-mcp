const http = require('http');
const handler = require('./api/index.js');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  handler(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`FikCut Gemini Streamable HTTP MCP Server running on http://0.0.0.0:${PORT}`);
  console.log(`MCP Endpoint: http://0.0.0.0:${PORT}/mcp`);
});
