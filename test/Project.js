const Project = artifacts.require("./Project.sol");
const Promise = require("bluebird");

contract('Project', function(accounts) {
    before("should promisify", function() {
        Promise.promisifyAll(web3.eth, { suffix: "Promise"});
    });

    it("should store information in info struct", function() {
        let deadline;

        return Project.new("name",accounts[0], 10000, 100,  { from: accounts[0], value:0 })
        .then(created => created.info()
            .then(info => {
                assert.strictEqual(web3.toUtf8(info[0]), "name");
                assert.strictEqual(info[1], accounts[0]);
                assert.strictEqual(info[2].toNumber(), 10000);
                deadline = info[3].toNumber();        
                return web3.eth.getTransactionPromise(created.transactionHash);
            })
            .then(tx => web3.eth.getBlockPromise(tx.blockNumber))
            .then(block => {
                assert.strictEqual(block.timestamp + 100, deadline);
            }));
    });

    it("should allow to fund a project and store who funded it", function() {
        return Project.new("name",accounts[0], 10000, 100,  { from: accounts[0], value:0 })
        .then(created => created.fund({from:accounts[0],value:100})
            .then(txObject => {
                return created.funders(accounts[0])
            }).then(funderBalance => {
                assert.strictEqual(funderBalance.toNumber(),100);
                return web3.eth.getBalancePromise(created.address);
            }).then(balance => 
                assert.strictEqual(balance.toNumber(),100)
            ));
    })

    it("should allow to fund a project and ask for payout when the deadline was met", function() {
        return Project.new("name",accounts[0], 10000, 0,  { from: accounts[1], value:0 })
            .then(created => created.fund({from:accounts[1],value:100})
                .then(txObject => {
                    return created.payout.call({ from: accounts[1], value:0 });
                }).then(success =>{
                    assert.strictEqual(true,success);
                })
            )
    });

    it("should allow to fund a project and reject payout when the deadline is not met", function() {
        
        return Project.new("name",accounts[0], 10000, 2000,  { from: accounts[1], value:0 })
            .then(created => created.fund({from:accounts[1],value:100})
                .then(txObject => {
                    return created.payout.call({ from: accounts[1], value:0 });
                }).then(success =>{
                    assert.strictEqual(false,success);
                })
            )
    });

    it("should allow for a refund after a fund", function() {
        return Project.new("name",accounts[0], 10000, 0,  { from: accounts[1], value:0 })
            .then(created => created.fund({from:accounts[1],value:100})
                .then(txObject => {
                    return created.refund(accounts[1],{ from: accounts[0], value:0 });
                }).then(successInt =>{
                    //assert.strictEqual(0,successInt.toNumber());
                    return created.funders(accounts[1]);
                }).then(balance => {
                    assert.strictEqual(0,balance.toNumber());
                })
            )
    });

});