# bcdk
BC Developer Kit

## quick start quide

### notes
This version uses BCDevOps/pipeline-cli v1.1 [link](https://github.com/BCDevOps/pipeline-cli/releases/tag/v1.1). 

The jenkins image(s)/scripts are from BCDevOps/openshift-components/.jenkins [link](https://github.com/BCDevOps/openshift-components/tree/master/.jenkins). 

The generators expect you to be logged into your openshift environment.  

You should have a shared/team github account that is a contributor to your projects.   

You will need to login to openshift, with enough permissions to administer your projects.  This process will create a secret for your jenkins jobs to pull your code from github.  

A documentation has been created when project [Zeva](https://github.com/bcgov/zeva/blob/master/openshift/README.md) adopted BCDK as their pull request based pipeline.  

### prerequisites

* npm

```sh
npm i yo -g
```

TODO: Consider using [`npx`](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) since it will install Yeoman if it doesn't exist.
```sh
npx yo @bcgov/bcdk:jenkins
npx yo @bcgov/bcdk:pipeline
npx yo @bcgov/bcdk:python-hello
```

### setup

```sh
npm install @bcgov/generator-bcdk@latest
```

If the above command gives you an error on Windows OS, you can manually link it using these commands.
```sh
git clone https://github.com/BCDevOps/bcdk.git -b <latest release branch>
cd bcdk
npm link
```

### usage

Move to a different directory outside of bcdk.

* Replace `your-project` with whatever your project will be called.
* Replace `app` with whatever bcdk template is to be used
* Ensure you are logged into an Openshift cluster

```sh
// change directory to your existing project where you like to add the pipeline
// OR create a new directory and initialize a repo

mkdir <your-project> 
cd <your-project>

// list the generators
yo bcdk --generators

// create the jenkins pipeline
yo bcdk:jenkins

// create your module/project/app pipeline
yo bcdk:pipeline

// add module/project/app 
yo bcdk:python-hello

// create your module/project/app jenkins job
yo bcdk:jenkins-job
```

#### bdck:jenkins
Not sure what build dev test environemts are for?  
Module name has no purpose here, it's jenkins. 

You will need to be logged into openshift, and you will need your shared github account and token.  

If you run this multiple times, you won't get all the prompts everytime, as your responses are saved in .yo-rc.json file.


**What is your openshift 'tools' namespace name?** \<your-openshift-tools namespace\>  
**Note: If you don't have a GitHub secret in the given namespace, you will be asked here
**We will need a GitHub username. We strongly recommend creating an account shared with the team for CI/CD/Automation purposes.** this is the name of your team's shared github account  
**What is the personal access token for the GitHub account?  
See https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line** enter the token   
**What is the GitHub organization where the repository is located?** \<your github org/owner\>  
**What is the repository's name?** \<your github repo\>  
**What is the Jenkinsfile path?** (use default) .jenkins/Jenkinsfile
**What is this module name?** enter jenkins  
**What is this module version? 1.0.0
**What environments are supported by your app?** (use default) build dev test prod  
**What namespace/project name is used for 'build?'** \<your-openshift-tools namespace\>  
**What namespace/project name is used for 'dev?'** \<your-openshift-tools namespace\>  
**What namespace/project name is used for 'test?'** \<your-openshift-tools namespace\>  
**What namespace/project name is used for 'prod?'** \<your-openshift-tools namespace\>  


#### bcdk:pipeline
Build your project's pipeline.  
Assume we are just creating a hello world application.  
 
**What is this module id/key?** answer with "."     
**What is this module name?** enter hello    
**What namespace/project name is used for 'build?'** \<your-openshift-tools namespace\>  
**What namespace/project name is used for 'dev?'** \<your-openshift-dev namespace\>  
**What namespace/project name is used for 'test?'** \<your-openshift-test namespace\>   
**What namespace/project name is used for 'prod?'** \<your-openshift-prod namespace\>   

#### bcdk:python-hello
Add your hello world application.  

Will create a .pipeline folder with examples for updates to your pipeline config.  Adds openshift templates and docker file and app code.  
**What do you want to call this component?** hello  

Update the .pipeline/lib files using the examples. 

```sh
cp .pipeline/examples/hello/build.js .pipeline/lib/build.js

cp .pipeline/examples/hello/deploy.js .pipeline/lib/deploy.js

// delete the examples
rm -rf .pipeline/examples
```


#### bcdk:jenkins-job
Will add a configured job to the .jenkins/.pipeline.  

**Module name?** (accept default) "."   
**Job name?** hello  
**What is the GitHub organization where the repository is located?**  \<your github org/owner\>  
**What is the repository's name?** \<your github repo\>   
**What is the Jenkinsfile path?** (use default) Jenkinsfile  

### create jenkins in your tools project

see .jenkins/README  

## Known Errors
  
### Error: Failed running 'git rev-parse HEAD:.jenkins/docker'  

Note that when code is only local, this version of pipeline-cli will fail. To fix this, push your new branch to Github.
```
> /Users/jason/Projects/bcdk-demo/.jenkins/.pipeline/node_modules/pipeline-cli/lib/util.js:169
>       throw new Error(`Failed running '${arguments[0]} ${arguments[1].join(" ")}' as it returned ${ret.status}`)
>       ^
> 
> Error: Failed running 'git rev-parse HEAD:.jenkins/docker' as it returned 128
```
  
### /bin/bash^M: bad interpreter: No such file or directory

When deploying from local command-line, Windows users might get errors due to line endings. It is recommended to implement .gitattributes to get the same build experience when pushing local code (see more notes below) or building from github.
```
Starting container "405130899ca676333a38b97a06caf90bbe3a1cba858ea2044729f00adeac0401" ...
/bin/sh: /tmp/scripts/assemble: /bin/bash^M: bad interpreter: No such file or directory
```

### error: .jenkins/.pipeline/npmw: cannot add to the index

```
D:\BCDevOps\bcgov-forks\agri-nmp>git update-index --chmod=+x D:\BCDevOps\bcgov-forks\agri-nmp\.jenkins\.pipeline\npmw
error: .jenkins/.pipeline/npmw: cannot add to the index - missing --add option?
fatal: Unable to process path .jenkins/.pipeline/npmw
```
First add and then update index
```
D:\BCDevOps\bcgov-forks\agri-nmp>git add --chmod=+x D:\BCDevOps\bcgov-forks\agri-nmp\.jenkins\.pipeline\npmw

D:\BCDevOps\bcgov-forks\agri-nmp>git update-index --chmod=+x D:\BCDevOps\bcgov-forks\agri-nmp\.jenkins\.pipeline\npmw
```


## Deploy Jenkins to Minisift
To deploy Jenkins to your minishift, you can replace `ROUTE_HOST` qualifier from `.pathfinder.gov.bc.ca` to you minishift in `.jenkins\.pipeline\lib\deploy.js`.  
**Note that GitHub webook won't work for Minishift Jenkins.

## Local Debugging
Install npm in your .pipeline and you can use the two methods below to debug and directly deploy to Openshift bypassing Jenkins.

### VSCode Debug Mode to test using local code
Add the below to your launch.json and debug any commands in your .pipeline.
```
       {
            "type": "node",
            "request": "launch",
            "name": "build",
            "cwd":"${workspaceFolder}/.pipeline",
            "program": "${workspaceFolder}/.pipeline/build.js",
            "env": {"DEBUG":"*"},
            "args": ["--pr=0","--dev-mode=true"],
            "console": "integratedTerminal"
        },
        {
            "type": "node",
            "request": "launch",
            "name": "deploy to DEV env",
            "cwd":"${workspaceFolder}/.pipeline",
            "program": "${workspaceFolder}/.pipeline/deploy.js",
            "env": {"DEBUG":"*"},
            "args": ["--pr=0","--env=dev"],
            "console": "integratedTerminal"
        },

```


## Bypass Jenkins to deploy directly to Openshift
Use --dev-mode=true to deploy your local code or omit it and code will be pulled from github

```shS
cd .pipeline
npm run build -- --pr=407 --env=build --dev-mode=true
npm run deploy -- --pr=407 --env=dev

```

## Automatically Clean Up Pull Request Deployments
The Github Webhook in Jenkins will execute the following clean command when a Pull Request is closed or merged.

```
npm run clean -- --env=transient --pr={pr-number}
```

To take advantage of this you can add `transient: true` property to your `phases` objects in `./pipeline/lib/config.js`

For example, the `build` and `dev` keys in the `phases` object below both contain the `transient: true` property.  This will cause the Github Webhook script to automatically run the `clean.js` script on the `build` and `dev` environments when a pull request is closed or merged.
```javascript
const phases = {
  build: {
    namespace: "tools",
    name: `${name}`,
    phase: "build",
    transient: true  // auto clean build
  },
  dev: {
    namespace: "dev",
    name: `${name}`,
    phase: "dev",
    transient: true  // auto clean dev
  },
  test: {
    namespace: "test",
    name: `${name}`,
    phase: "test",
  },
  prod: {
    namespace: "prod",
    name: `${name}`,
    phase: "prod",
  }
};
```

## License

Apache-2.0 © Province of British Columbia
