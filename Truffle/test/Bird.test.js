const Bird = artifacts.require("Flappy");

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

contract("Bird", accounts => {
    it("Able to recieve ETH", async () => {
        return Bird.deployed().then(async instance => {
            await instance.sendTransaction({value: web3.utils.toWei('10', 'ether')});
            const balance = await web3.eth.getBalance(instance.address);
            assert.equal(balance, web3.utils.toWei('10', 'ether'));
        })
    })

    it("Complete game function", async () => {
        return Bird.deployed().then(async instance => {
            await instance.sendTransaction({value: web3.utils.toWei('10', 'ether')});
            return instance.gameComplete.call(30, {from: accounts[1]});
        }).then(result => {
            return result.toNumber()
        }).then(
            reward => {
                return web3.eth.getBalance(accounts[1])
            }
        ).then(
            balance => {
                console.log(balance)
                assert.equal(balance, web3.utils.toWei('1000000', 'ether') );
            }
        )
    })

})
