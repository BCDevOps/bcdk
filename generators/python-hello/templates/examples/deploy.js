"use strict";
const { OpenShiftClientX } = require("pipeline-cli");
const path = require("path");

module.exports = settings => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;
  const oc = new OpenShiftClientX({ namespace: phases[phase].namespace });
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, "../../openshift"));
  var objects = [];

  objects = objects.concat(
    oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/python-deploy.yaml`, {
      param: {
        NAME: `${phases[phase].name}<%= name%>`,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        HOST: phases[phase].host || "",
      },
    }),
  );

  oc.applyRecommendedLabels(
    objects,
    phases[phase].name,
    phase,
    phases[phase].changeId,
    phases[phase].instance,
  );
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);
  oc.applyAndDeploy(objects, phases[phase].instance);
};
