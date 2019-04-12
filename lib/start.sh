
checkPrerequisitesPresent(){
  upgradeOcLatest
  checkNodeCorrectVersionPresent
  #needs to be run twice
  checkNodeCorrectVersionPresent
  npm install -g yo
  npm link
  if yo --help | grep -q '^10'; then
    echo -e \\n"Could not detect yo on system.  Are you sure it has been installed?"\\n
    exit 1
  fi
}

checkNodeCorrectVersionPresent(){
  if node --version | grep -q '^10'; then
    nvm install 10
  fi
}

upgradeOcLatest(){
  brew install openshift-cli
  brew update
  brew upgrade openshift-cli
}
