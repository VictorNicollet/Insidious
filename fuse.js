const { fusebox } = require("fuse-box");
 
const fuse = fusebox({
  entry: "src/index.tsx",
  target: "browser",
  homeDir: "src",
  output: "dist/$name.js",
});
 
fuse.runDev({
  bundles: {
    rootDir: "dist",
    app: "insidious.js"
  }
});