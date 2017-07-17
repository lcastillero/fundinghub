var Migrations = artifacts.require("./Migrations.sol");
var FundingHub = artifacts.require("./FundingHub.sol");
var Project = artifacts.require("./Project.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(FundingHub);
  deployer.deploy(Project,"Test",10,10,10);
};
