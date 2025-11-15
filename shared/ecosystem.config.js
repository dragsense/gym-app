module.exports = {
  apps: [
      {
          name: "trainer-prod",
          script: "dist/src/main.js",
          env: {
              NODE_ENV: "production",
          },
      },
      {
          name: "trainer-dev",
          script: "dist/src/main.js",
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
          repo: "git@github.com:dragsense/gym-app.git",
          path: "/var/www/trainer_usr/data/www/trainer.digital.st/prod",
          key: "C:/Users/ranaa/.ssh/trainer-server",
          "post-setup": "touch ../shared/.env ../shared/.env.production ../shared/.env.prod",
          "post-deploy": "sh ./deploy.sh",
      },

      dev: {
          user: "root",
          host: "66.103.211.113",
          ref: "origin/dev",
          repo: "git@github.com:dragsense/gym-app.git",
          path: "/var/www/trainer_usr/data/www/trainer.digital.st/dev",
          key: "C:/Users/ranaa/.ssh/trainer-server",
          "post-setup": "touch ../shared/.env ../shared/.env.development ../shared/.env.prod",
          "post-deploy": "sh ./deploy.sh"
      },
  },
};

