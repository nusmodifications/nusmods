import http from 'http';

const server = http.createServer((req, res) => {
  res.write("hello");
  res.end();
});

export default server.listen(8000);
