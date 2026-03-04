# Production Server Setup Guides

This document contains deployment notes for NUSMods services that run outside Vercel.

## Website and Export Deployment

The website and export services are deployed on Vercel.

The old Docker deployment files and scripts (`docker-compose*.yml`, `prod-up.sh`,
`prod-deploy.sh`, `prod-down.sh`, and `website/scripts/promote-staging.sh`) were
removed from this repository. Deployment is now managed through Vercel project settings.

If you need to self-host website/export outside Vercel, use an older commit as a
reference and maintain your own deployment workflow.

## CentOS API Server Setup

NUS’s new student development platform runs CentOS 7 instead of the Ubuntu that we normally run. The instructions below will set up the scraper and API server on CentOS 7.

1. Install software (run the commands below as root – log in as root by running `sudo su -`)
    1. Install git: `yum install -y git`.
    1. Install Nginx and enable its systemctl service by following https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-centos-7.
    1. Install Node.js.
    1. [Install pnpm](https://pnpm.io/installation).
    1. Install and enable PM2: `pnpm add -g pm2 && pm2 startup systemd`
    1. As a regular user, ensure that you can run PM2 by running `pm2`. If `pm2` can't be executed, check the permissions of the /usr/local/lib/npm folder. Try running  **(untested!)** `chmod u+rx -R /usr/local/lib/npm/bin`.
1. Configure scraper
    1. Clone the NUSMods repository: `git clone https//github.com/nusmodifications/nusmods.git`.
    1. `cd nusmods/scrapers/nus-v2`
    1. Follow the getting started instructions in the [scraper README.md](https://github.com/nusmodifications/nusmods/tree/master/scrapers/nus-v2#getting-started) to set up the scraper. If you have SSH access to existing scraper servers, you can use `scp` to copy their env.json for convenience.
    1. Test that the scraper will work by running `pnpm dev test | pnpm bunyan`. If you see an error, it may actually just be a transient issue with the NUS APIs that the test script pings; they throw many random errors all the time.
    1. Enable scraper service by running `pm2 start ecosystem.config.js`.
1. Configure file server
    1. (Optional) Copy production API data from existing data servers to a `/home/<username>/api.nusmods.com` folder: on the data server, run `scp -r api.nusmods.com <target server>:~`.
    1. Configure Nginx (run below commands as root)
        1. `cd /etc/nginx`
        1. Edit `nginx.conf`: comment out the default `server` block.
        1. Copy [this gist](https://gist.github.com/taneliang/3c6fdbb1a993fd24afcaafeb9a750f0c) to a new `conf.d/api.nusmods.com.conf` file. Be sure to correct the path to the API data folder.
        1. `systemctl enable nginx`
        1. `systemctl restart nginx`
    1. Visit the IP address of the server in your browser. If you see a 403 Forbidden error:
        1. Configure folder permissions.
            1. Obtain the directory permissions of the data folder and all its parent directories: `namei -om /home/<username>/api.nusmods.com`.
            1. All folders in the list require read and execute permissions. If some folders do not have them, run `chmod a+rx <folder>`.
        1. Configure SELinux to allow the data folder to be served: [`chcon -Rt httpd_sys_content_t /home/<username>/api.nusmods.com`](https://stackoverflow.com/a/26228135/5281021).
        1. Change existing file permissions if necessary: `chmod a+r -R api.nusmods.com`.
    1. Set ACL policies on the data directory to ensure that all future directories and files can be served by Nginx: `setfacl -R -d --set u::rwx,g::rx,o::rx api.nusmods.com`.
1. Add a DNS record to point to the server's public address.
1. Set up HTTPS.
