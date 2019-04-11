'use strict';
const options= require('pipeline-cli').Util.parseArguments()
const changeId = options.pr //aka pull-request
const version = '<%= version%>'
const name = '<%= name%>'
// <%= environments.build.namespace%>
const phases = {
  <%_ Object.keys(environments).forEach(function(envName){ _%>
  <%_ if (envName === "prod" || envName === "test") { _%>
  <%= envName%>: {namespace:'<%= envName%>'    , name: `${name}`, phase: '<%= envName%>'  , changeId:changeId, suffix: `-<%= envName%>`  , instance: `${name}-<%= envName%>`  , version:`${version}`, tag:`<%= envName%>-${version}`},
  <%_ } else { _%>
  <%= envName%>: {namespace:'<%= envName%>'    , name: `${name}`, phase: '<%= envName%>'  , changeId:changeId, suffix: `-<%= envName%>-${changeId}`  , instance: `${name}-<%= envName%>-${changeId}`  , version:`${version}-${changeId}`, tag:`<%= envName%>-${version}-${changeId}`},
  <%_ } _%><%_ }); _%>
};

// This callback forces the node process to exit as failure.
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = exports = {phases, options};