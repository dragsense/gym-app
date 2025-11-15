module.exports = {
  apps: [
      {
          name: "template-prod",
          script: "./backend/dist/src/main.js",
          env: {
              NODE_ENV: "production",
          },
      },
  ],

  deploy: {
      prod: {
          user: "root",
          host: "66.103.211.113",
          ref: "origin/main",
          repo: "git@github.com/template-app.git",
          path: "/var/www/trainer_usr/data/www/template/prod",
          key: "C:/Users/ranaa/.ssh/trainer-server",
          "post-setup": "touch ../shared/.env ../shared/.env.prod",
          "post-deploy": "sh ./deploy.sh",
      },
  },
};

