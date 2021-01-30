const Nftrees = artifacts.require("Nftrees");

module.exports = function (deployer) {
  deployer.deploy(Nftrees, "ipfs://asfkdjaskldfhasiufbsakjdfnaskdfjk/");
};
