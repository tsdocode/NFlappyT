
// Helper function
function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    );
}


Helper = {
    birdIndex : -1,
    contracts: {},
  
    load: async () => {
      await Helper.loadWeb3();
      await Helper.loadAccount();
      await Helper.loadContract();
      await Helper.loadNFT();
      await Helper.evenHandler();
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (window.ethereum) {
        Helper.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            Helper.account = account;
            // Acccounts now exposed
        } catch (error) {
            // User denied account access...
            console.log(error);
        }
    }
    // Legacy dHelper browsers...
    else if (window.web3) {
        Helper.web3 = new Web3(web3.currentProvider);
        web3.eth.sendTransaction({/* ... */});
    }
    // Non-dHelper browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
        Helper.web3.eth.defaultAccount = Helper.account;
    },
  
    loadContract: async () => {
        console.log(Env.contract_address);
        Helper.contract =  new Helper.web3.eth.Contract(CONTRACT_ABI.abi, Env.contract_address);
    },
  
    render: async () => {
      // Prevent double render
      if (Helper.loading) {
        return;
      }
  
      // Update Helper loading state
      Helper.setLoading(true);
  
      // Render Account
      $('#account').html(Helper.account);

      Helper.setLoading(false);

  
    //   // Render Tasks
    //   await Helper.renderTasks()
  
      // Update loading state
    },
  
    loadNFT: async () => {
        // Load the contract data
        console.log(Helper.contract.methods);
        $('.bird').empty();
        await Helper.contract.methods.checkIfUserHasNFT(Helper.account).call()
            .then(result => {
                Helper.collections = result;   
                if (Helper.collections.length > 0) {
                  Helper.birdIndex = 0;
                } else {
                  Helper.birdIndex = -1;
                }
            });

    },

    luckyDraw: async () => {

        let randomNumber = between(2112001, 99999999);

        console.log(randomNumber);

        
        await Helper.contract.methods.luckyDraw(randomNumber).send({from: Helper.account})
            .then(result => {
                console.log(result);
                Helper.loadNFT();
            }
        );
    },

    evenHandler: async () => {
      console.log(Helper.contract.events);
      Helper.contract.events.GameReward()
        .on("data", event => {
            _player = event.returnValues._player;
            _reward = event.returnValues._ether / Math.pow(10,18);
            console.log("USER " + _player + " GOT " + _reward + " ETH");
        }); 
    },

    gameComplete: async (score, birdId) => {
        console.log("BirdID" , birdId);
        await Helper.contract.methods.gameComplete(score, birdId).send({from: Helper.account})
            .then(result => {
                
                Helper.loadNFT();
                console.log(result);
            });

    },
    sellForShop: async (birdId) => {
      await Helper.contract.methods.sellForShop(birdId).send({from: Helper.account})
        .then(result => {
                
                Helper.loadNFT();
                console.log(result);
            });
    }
  };

Helper.load();
  
