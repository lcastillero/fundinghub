pragma solidity ^0.4.4;

import "./Project.sol";

contract FundingHub {
  
  address public owner;
  mapping(address => bytes32) public projects;

  function FundingHub () {
    owner = msg.sender;
  }

  function createProject(bytes32 projectName, uint etherGoal, uint duration) {
    address newProjectAddress = new Project(projectName, msg.sender, etherGoal, duration);
    projects[newProjectAddress] = projectName;
  }

  function contribute(address projectAddress) payable {
    if(msg.value > 0) {
      if(projects[projectAddress] == 0x000) throw;
    
      Project project = Project(projectAddress);
      project.fund.value(msg.value)();
    }
  }
}
