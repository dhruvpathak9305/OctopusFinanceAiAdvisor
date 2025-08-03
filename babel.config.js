module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "@/components": "./components",
            "@/lib": "./lib",
            "@/types": "./types",
            "@/utils": "./utils",
            "@/hooks": "./hooks",
            "@/contexts": "./contexts",
            "@/services": "./services",
            "@/mobile": "./mobile",
            "@/src": "./src",
            "@/shared": "./shared",
            "@/constants": "./constants"
          }
        }
      ]
    ],
  };
}; 