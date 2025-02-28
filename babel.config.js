module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        "module:metro-react-native-babel-preset",
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript"
      ],
      plugins: ["@babel/plugin-transform-runtime"],
    };
  };
  