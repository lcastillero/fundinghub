pragma solidity ^0.4.4;

contract Project {

    struct Info {
        bytes32 name;
        address owner;
        uint toBeRaised;
        uint deadLine;
    }

    Info public info;
    mapping(address => uint) public funders;
    
    function Project(bytes32 projectName, address projectOwner, uint etherGoal, uint duration) {
        info = Info(projectName, projectOwner, etherGoal, now + duration);
    }

    function fund() payable {
        if(msg.value > 0) {
            info.toBeRaised += msg.value;
            funders[msg.sender] += msg.value;
        }
    }

    function payout() returns (bool successful) {
        if(block.timestamp < info.deadLine ) {
            return false;
        }

        if(!info.owner.send(this.balance)) throw;

        return true;
    }

    function refund(address funder) returns (uint successful) {
        if(funders[funder] == 0) {
            return 1;
        }
        funders[funder] = 0;

        if(!funder.send(funders[funder])) throw;

        return 0;
    }
}