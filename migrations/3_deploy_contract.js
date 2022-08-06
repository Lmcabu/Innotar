const Authenticity = artifacts.require("Authenticity");

module.exports = function(deployer) {
  deployer.deploy(Authenticity);
};