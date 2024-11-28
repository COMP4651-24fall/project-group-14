// Import path for resolving file paths
let path = require("path");
module.exports = {
  mode: "production",
  // Specify the entry point for our app.
  entry: [path.join(__dirname, "type.js")],
  // Specify the output file containing our bundled code.
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  // Enable WebPack to use the 'path' package.
  resolve:{
    extensions: ['.ts', '.js', '.json', '.css'],
    fallback: { path: require.resolve("path-browserify")}
  }
};