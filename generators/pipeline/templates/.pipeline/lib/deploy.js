'use strict';
const {OpenShiftClientX} = require('pipeline-cli')
const path = require('path');

module.exports = (settings)=>{
  const phases = settings.phases
  const options= settings.options
  const phase=options.env
  const changeId = phases[phase].changeId
  const oc=new OpenShiftClientX({'namespace':phases[phase].namespace});
  const templatesLocalBaseUrl =oc.toFileUrl(path.resolve(__dirname, '../../openshift'))
  var objects = []

  //Example: Create objects if missing
  /* 
  oc.createIfMissing(oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/secrets.yaml`, {
    'param':{}
  }))
  */

  // Example: Create actual secrets objects, but the values will be replaced with the ones from a template
  /*
  objects.push(... oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/secrets.yaml`, {
    'param':{}
  })
  */

  //Deployment objects for Patroni
  /*
  objects.push( ... oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/deployment.yaml`, {
    'param':{ }
  })
  */

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, phases[phase].instance)
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag)
  oc.applyAndDeploy(objects, phases[phase].instance)
}