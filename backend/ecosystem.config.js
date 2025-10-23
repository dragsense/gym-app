module.exports = {
    apps: [
        {
            name: "payback-prod",
            script: "dist/main.js",
            env: {
                NODE_ENV: "production",
            },
        },
        {
            name: "payback-dev",
            script: "dist/main.js",
            env: {
                NODE_ENV: "development",
            },
        },
    ],

    deploy: {
        prod: {
            user: "root",
            host: "72.60.107.19",
            ref: "origin/main",
            repo: "git@github.com:dragsense/pay-back.git",
            path: "/var/www/webadmin/data/www/paybackbilling.com/app/prod",
            key: "C:/Users/ranaa/.ssh/payback",
            "post-setup": "touch ../shared/.env ../shared/.env.production ../shared/.env.prod",
            "post-deploy": "sh ./prod-deploy.sh",
        },

        dev: {
            user: "root",
            host: "72.60.107.19",
            ref: "origin/dev",
            repo: "git@github.com:dragsense/pay-back.git",
            path: "/var/www/webadmin/data/www/paybackbilling.com/app/dev",
            key: "C:/Users/ranaa/.ssh/payback",
            "post-setup": "touch ../shared/.env ../shared/.env.development ../shared/.env.prod",
            "post-deploy": "sh ./deploy.sh"
        },
    },
};

