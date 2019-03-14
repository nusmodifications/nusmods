import http from 'http';
import app from './app';

// Export default for fusebox to hotreload
// Using http.createServer to get access to .close method
export default http.createServer(app).listen(process.env.PORT);
