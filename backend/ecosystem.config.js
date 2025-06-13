module.exports = {
  apps : [{
    script: './src/server.js',
    out_file: "./out.log",
    error_file: "./error.log",
    watch: '.',
    ignore_watch: [
                "node_modules",
                "tokens.json",
            ],
  }],
};
