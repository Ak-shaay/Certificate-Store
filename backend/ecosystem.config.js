const path = require('path');

module.exports = {
  apps: [{
    name: 'my-app',
    script: './src/server.js',
    out_file: './out.log',
    error_file: './error.log',
    watch: [path.resolve(__dirname, 'src')],
    ignore_watch: [
      path.resolve(__dirname, 'tokens.json'),
      path.resolve(__dirname, 'node_modules'),
    ],
  }],
}