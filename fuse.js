const { FuseBox } = require("fuse-box");
 
const fuse = FuseBox.init({
  homeDir: "src",
  output: "dist/$name.js",
});
 
fuse.bundle("insidious").instructions(`> index.ts`);
 
fuse.run();