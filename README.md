# bcdk
BC Developer Kit

## quick start quide

### notes
This version uses BCDevOps/pipeline-cli v1.0 [link](https://github.com/BCDevOps/pipeline-cli/releases/tag/v1.0).   

The jenkins image(s)/scripts are from BCDevOps/openshift-components/.jenkins [link](https://github.com/BCDevOps/openshift-components/tree/cvarjao-update-jenkins-basic/.jenkins). 

The generators expect you to be logged into your openshift environment.  

You should have a shared/team github account that is a contributor to your projects.   

You will need to login to openshift, with enough permissions to administer your projects.  This process will create a secret for your jenkins jobs to pull your code from github.  

### prerequisites

* npm

```sh
npm i yeoman -g
```

### setup

```sh
git clone https://github.com/BCDevOps/bcdk.git -b bugfix/0.0.2
cd bcdk
npm link
```

### usage

Move to a different directory outside of bcdk.

* Replace `your-project` with whatever your project will be called.
* Replace `app` with whatever bcdk template is to be used


```sh
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

**What is your openshift 'tools' namespace name?** \<your-openshift-tools namespace\>  
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

Note that when code is only local, this version of pipeline-cli will fail.  

> /Users/jason/Projects/bcdk-demo/.jenkins/.pipeline/node_modules/pipeline-cli/lib/util.js:169
>       throw new Error(`Failed running '${arguments[0]} ${arguments[1].join(" ")}' as it returned ${ret.status}`)
>       ^
> 
> Error: Failed running 'git rev-parse HEAD:.jenkins/docker' as it returned 128




