module.exports = {
  apps: [
    {
      name: "functions", // Name of your app
      script: "./index.js", // Path to your main application file
      instances: 1, // Single instance for testing
      exec_mode: "fork", // Use fork mode for a single instance
      env: {
        NODE_ENV: "development", // Use 'production' for production environment
        PORT: 6060, // Port your app will run on
      },
    },
  ],
};
