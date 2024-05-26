![Version](https://img.shields.io/badge/version-v1.2.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2012.0.0-brightgreen.svg)
![License](https://img.shields.io/github/license/Fried-Chicken/ghost-static-site-generator.svg)
![Stars](https://img.shields.io/github/stars/Fried-Chicken/ghost-static-site-generator.svg)
![Forks](https://img.shields.io/github/forks/Fried-Chicken/ghost-static-site-generator.svg)
![Issues](https://img.shields.io/github/issues/Fried-Chicken/ghost-static-site-generator.svg)
# ghost-static-site-generator
A tool for generating static sites from [ghost](https://ghost.org/) blogs. This is based loosely on [buster](https://github.com/axitkhurana/buster) but since that project has been abandoned I've decided to create a new tool. 

There are many reasons for wanting to generate a static site. For example security benefits and speed. It's also possible to integrate this tool into a continuous integration process and deploy the generated site.

## Prerequisites
You need to have the following installed.
- Node >=12 or LTS
- wget v1.16 (Versions prior to will need to use the --silent flag as --show-progress is not available)
- [Chocolatey](https://docs.chocolatey.org/en-us/choco/setup) (Windows only)

>Note: Chocolatey usually comes with NodeJS and you don't need to install it separately.

## Installation

### Linux & Mac
1. Install wget
```
$ brew install wget
```
2. Clone this repository
```
$ git clone https://github.com/itsignacioportal/ghost-static-site-generator/
$ cd ghost-static-site-generator
$ npm install
```

### Windows
1. Install wget via chocolatey
```
$ choco install wget
```
2. Clone this repository
```
$ git clone https://github.com/itsignacioportal/ghost-static-site-generator/
$ cd ghost-static-site-generator
$ npm install
```

### Docker
To install docker see: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
1. [Optional Build] Clone this repository
```bash
$ git clone https://github.com/itsignacioportal/ghost-static-site-generator/
$ cd ghost-static-site-generator
$ docker build -t ghost-static-site-generator:latest .
```

2. Run image with volume mounted.
#### Network config
    - to access localhost add `--network host` 
    - to access another container
        1. `docker network create --attachable ghost-scrape`
        2. `docker network connect ghost-scrape <YOUR GHOST CONTAINER>`
        3. add `--network ghost-scrape` to your command

```bash
# Make output dir
$ mkdir ./data

# Run and remove container when done
$ docker run --rm -it \
    -v ./data:/data \
    SimonM0/ghost-static-site-generator:latest \
    --domain http://www.myhiddenserver.com:4538 \
    --productionDomain http://www.myblog.com
```

## Usages
By default the tool will default to `http://localhost:2368` for the domain and generate a folder called `static` in the directory that you run the tool in.

**NOTE:** Themes other than Casper aren't fully supported. If you use another theme, you _might_ have to manually copy the `assets\built\THEME-NAME.js` file from your server.
**NOTE:** gssg has been tested only on ghost 4.48.2

## Recipes
Assuming you are hosting locally on `http://localhost:2368` and your domain is `http://www.myblog.com` then you can run the following. You need to pass the url flag because all links need to be replaced with your domain name instead of localhost
```
$ node src\index.js --productionDomain http://www.myblog.com
```

Assuming you are hosting remotely on `http://www.myhiddenserver.com:4538` and your domain is `http://www.myblogbucket.com` then you can run the following. You need to pass the url flag because all links need to be replaced with your domain name instead of localhost
```
$ node src\index.js --domain http://www.myhiddenserver.com:4538 --productionDomain http://www.myblog.com
```

Assuming you are hosting remotely on `http://www.myhiddenserver.com:4538` and you want to pull into a separate folder instead of static you can use the following command
```
$ node src\index.js --domain http://www.myhiddenserver.com:4538 --dest myblog-static-folder
```

## API 
### Generating a static site
This assumes that your site is running locally at `http://localhost:2368` and will output to a folder called static.
```
$ node src\index.js
```

### Generate static site from a custom domain
If your site is not hosted locally you can use the `--domain` flag to target the your site.
```
$ node src\index.js --domain "http://localhost:2369"
```

### Generate static site to a custom folder
To change the folder that the static site is generated into using the `--dest` flag.
```
$ node src\index.js --dest "myStaticSiteFolder"
```

### Preview site
This will generated the site and then open the site in a new browser window. Please note: If you want to preview the site then the `--productionDomain` flag is ignored. This is because the links need to replace with the preview server's url.
```
$ node src\index.js --preview
```

### Replace url
Use this flag to replace the url, use this option if your site url differs to your ghost url
```
$ node src\index.js --productionDomain 'http://www.mydomain.com'
```

### Hosting a site in sub directories
Use this flag in conjunction with the `--dest` flag to host sites in directories. This flag will replace all relative path urls with absolute path urls
```
$ node src\index.js --dest 'a-random-folder' --subDir 'a-random-folder'
```

### Silent mode
Use this flag to hide wget output
```
$ node src\index.js --silent
```

### Fail on error
This option will output the failed wget command and also any errors to the stdout before exiting.
```
$ node src\index.js --fail-on-error
```

### Ignore Absolute Paths
This option is intended for users who do no worry about SEO. This option will make your site truly relative and swap out all domain names for relative paths.
```
$ node src\index.js --ignore-absolute-paths
```

### Save redirected assets as referer path
This option saves redirected content with the original referer path instead of the destination path. Note: from a file size perspective this is suboptimal as it results in each redirect saving a copy of the original file.
```
$ node src\index.js --saveAsReferer
```

## Contributing

This is still a work in progress, please feel free to contribute by raising issues or creating pr's.
