function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}


App = {
    loading: false,
    contracts: {},
  
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.evenHandler()
      await App.render()
      await App.loadNFT()
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (window.ethereum) {
        App.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            App.account = account;
            // Acccounts now exposed
        } catch (error) {
            // User denied account access...
            console.log(error)
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        App.web3 = new Web3(web3.currentProvider);
        web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
        App.web3.eth.defaultAccount = App.account;
    },
  
    loadContract: async () => {
        const abi = await $.getJSON('Flappy.json', data => {
            App.contract =  new App.web3.eth.Contract(data.abi, "0x38BA4D19f9ef61fd070347D0e5a4DDd59D342EAe");
            console.log(App.contract)
        })
    },
  
    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render Account
      $('#account').html(App.account)

      App.setLoading(false)

  
    //   // Render Tasks
    //   await App.renderTasks()
  
      // Update loading state
    },
  
    loadNFT: async () => {
        // Load the contract data
        console.log(App.contract.methods)
        $('.bird').empty()
        await App.contract.methods.checkIfUserHasNFT(App.account).call()
            .then(result => {
                console.log(result)
                for (const element of result) {
                    $('.bird').append(element.stamina + "<br>")
                }             
            })

    },

    luckyDraw: async () => {

        let randomNumber = between(2112001, 99999999)

        console.log(randomNumber)

        
        await App.contract.methods.luckyDraw(randomNumber).send({from: App.account})
            .then(result => {
                console.log(result)
                App.loadNFT()
            }
        )
    },

    evenHandler: async () => {
      console.log(App.contract.events)
      App.contract.events.GameReward()
        .on("data", event => {
            _player = event.returnValues._player
            _reward = event.returnValues._ether / Math.pow(10,18)
            console.log("USER " + _player + " GOT " + _reward + " ETH")
        })      
    },

    gameComplete: async (score, birdId) => {
        await App.contract.methods.gameComplete(score, birdId).send({from: App.account})
            .then(result => {
                App.loadNFT()
                console.log(result)
            })

    },
  
    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })
  