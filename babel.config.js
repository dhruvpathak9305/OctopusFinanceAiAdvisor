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
            "@": ["./"],
            "@/contexts": ["./contexts"],
            "@/components": ["./components"],
            "@/src": ["./src"]
          }
        }
      ]
    ]
  };
}; 