# Production Server Setup Guides

Guides to set up NUSMods on production servers.

## Dockerized Production Server Setup (Ubuntu)

Most of NUSMods is able to run in Docker containers, but some parts of NUSMods (most notably the scraper, analytics.nusmods.com, and the URL shortener) are not. These steps set up a production server to host the Dockerized section of NUSMods, which currently includes the website and export server.

1. Set up DigitalOcean droplet:
    1. Create a new DigitalOcean droplet. We recommend this configuration, which will cost $20 a month:
        * Ubuntu 18.04 LTS x64
        * 2 CPUs
        * 4GB RAM
        * Datacenter region: Singapore 1. Anywhere in Singapore minimizes distance to most of our users, and all existing NUSMods servers are in this datacenter.
    1. Open droplet page, and enable Floating IP.
    1. For security, configure a firewall to only expose ports 22, 80, and 443. Within the NUSMods organization, we have one already configured called the `everything-firewall` – just use that.
1. Set up DNS records (we use Cloudflare)
1. Configure OS:
    1. Create user account:
        1. SSH into the `root` account on the new server.
        1. Add a user account. We'll name ours `mods`: `adduser mods`
        1. Grant the new account sudo privileges: `usermod -aG sudo mods`
        1. Log in as the new user: `su - mods`
        1. cd to new home directory: `cd`
        1. Optionally create an SSH key to allow the new server to SSH into other servers to copy configs/secrets/data: `ssh-keygen -t ed25519 -a 100`
        1. IF you didn't create a key, create `.ssh` directory; use this hack to make SSH do the work for you: `ssh-keygen; rm .ssh/*`
        1. `cd .ssh`
        1. Create `authorized_keys` file in `.ssh` containing all the public keys which you want to allow, or copy it from another server.
    1. Install dependencies:
        1. `sudo apt update`
        1. `sudo apt upgrade`
        1. Install Docker, following instructions at https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04.
        1. Allow `mods` account to run Docker without sudo: `sudo usermod -aG docker`
        1. Install Docker Compose, following the instructions on https://docs.docker.com/compose/install/.
        1. Ensure that `docker run hello-world` works.
    1. Secure SSH:
        1. Open /etc/ssh/sshd_config
        1. Uncomment `PubkeyAuthentication yes`
        1. Comment out `PermitRootLogin yes`
        1. Ensure that `PasswordAuthentication no` is present and not commented out.
        1. Run `service sshd restart`
        1. End the SSH session.
1. Configure NUSMods services:
    1. SSH into the `mods` account on the new server.
    1. In the user's home directory, `git clone https://github.com/nusmodifications/nusmods.git`
    1. `cd nusmods`
    1. Inject secrets by creating all the appropriate .env files. If on an official NUSMods server, simply copy the secrets directory over and run `link-secrets.sh ../nusmods`

## Dockerized Production Server Setup ([NUS Student Development Platform](https://icode4nus.sg/))

The instructions below will set up our dockerized services on CentOS 7, which is used by NUS's new student development platform.

1. Follow [these instructions](https://icode4nus.sg/EC2-Request.pdf) to spin up a new EC2 instance using the AWS Service Catalog.
1. Wait for instance to be provisioned.
1. Through email, request for ports 80 and 443 to be exposed to the public Internet.
1. Using the AWS console's jump server, SSH into the instance: `ssh -o ServerAliveInterval=180 <NUSNET ID Exxxxxxx>@<instance IP address>`
1. Configure OS:
    1. Install dependencies:
        1. `sudo yum update`
        1. Install git: `yum install -y git`.
        1. Install Docker. Because we don't have permission to run `sudo sh` (or `sudo su`), the Docker installation script will fail. Instead, run the commands manually:
           1. Generate Docker installation commands: `curl -fsSL https://get.docker.com/ | DRY_RUN=1 sh`
           1. Run all commands with `sudo`.
           1. Start the Docker daemon: `sudo systemctl start docker`
           1. Ensure Docker daemon starts on reboot: `sudo systemctl enable docker`
        1. Allow your user account to run Docker without sudo: `sudo usermod -aG docker <NUSNET ID>`, then log out and log back in.
        1. Ensure that `docker run hello-world` works.
        1. Install Docker Compose:
           1. At https://github.com/docker/compose/releases, copy the link to the latest `docker-compose-Linux-x86-64` release asset.
           1. Download Docker Compose: `curl --create-dirs -L "<the link you copied>" -o ~/bin/docker-compose`
           1. Make it executable: `sudo chmod +x ~/bin/docker-compose`
           1. [Fix permission error when starting `docker-compose`](https://stackoverflow.com/a/58068483):
              1. `mkdir $HOME/tmp`
              1. `export TMPDIR=$HOME/tmp`
              1. `echo "export TMPDIR=$HOME/tmp" >> ~/.bashrc`
        1. Ensure that `docker-compose version` works.
1. Set up DNS records (we use Cloudflare).
1. Configure NUSMods services:
    1. `git clone https://github.com/nusmodifications/nusmods.git`
    1. `cd nusmods`
    1. Create and populate `export/env`
1. Fix Chromium startup crash: `sysctl -w user.max_user_namespaces=1000`.
1. Start up the NUSMods services: `CF_API_KEY=<Cloudflare Global API Token> ./prod-up.sh`
   
To deploy future updates, run `./prod-deploy.sh`. To spin down all services, run `./prod-down.sh`.

## CentOS API Server Setup

NUS’s new student development platform runs CentOS 7 instead of the Ubuntu that we normally run. The instructions below will set up the scraper and API server on CentOS 7.

1. Install software (run the commands below as root – log in as root by running `sudo su -`)
    1. Install git: `yum install -y git`.
    1. Install Nginx and enable its systemctl service by following https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-centos-7.
    1. Install Node.js.
    1. [Install Yarn](https://yarnpkg.com/lang/en/docs/install/#centos-stable).
    1. Install and enable PM2: `yarn global add pm2 && pm2 startup systemd`
    1. As a regular user, ensure that you can run PM2 by running `pm2`. If `pm2` can't be executed, check the permissions of the /usr/local/lib/npm folder and the /usr/local/share/.config/yarn/global folders. Try running  **(untested!)** `chmod u+rx -R /usr/local/lib/npm/bin /usr/local/share/.config/yarn/global`.
1. Configure scraper
    1. Clone the NUSMods repository: `git clone https//github.com/nusmodifications/nusmods.git`.
    1. `cd nusmods/scrapers/nus-v2`
    1. Follow the getting started instructions in the [scraper README.md](https://github.com/nusmodifications/nusmods/tree/master/scrapers/nus-v2#getting-started) to set up the scraper. If you have SSH access to existing scraper servers, you can use `scp` to copy their env.json for convenience.
    1. Test that the scraper will work by running `yarn dev test | yarn bunyan`. If you see an error, it may actually just be a transient issue with the NUS APIs that the test script pings; they throw many random errors all the time.
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
