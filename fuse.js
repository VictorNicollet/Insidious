const { fusebox } = require("fuse-box");
const { pluginTypeChecker } = require('fuse-box-typechecker');
 
const fuse = fusebox({
  entry: "src/index.tsx",
  target: "browser",
  homeDir: "src",
  output: "dist/$name.js",
  devServer: true,
  cache: {
    enabled: true,
    strategy: "memory"
  },
  plugins:[pluginTypeChecker({
    tsConfig: './src/tsconfig.json',
    name: "Insidious"
  })]
});
 
fuse.runDev({
  bundles: {
    rootDir: "dist",
    app: "insidious.js"
  }
});