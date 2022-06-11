


function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return false;
    }
}

var Game = pc.createScript('game');

const select_bird = (template, id) => {
    // console.log(id);

    try {
        var asset_id = this.app.assets.find(id.sprite,  'sprite').id;
        template.sprite.spriteAsset = asset_id;
        template.sprite.width = 2;
        template.sprite.height = 2;
        template.sprite.clip('Flap').spriteAsset = asset_id;
        template.sprite.play('Flap');
    } catch(err){
        console.log(err);
    }
};

const select_bird_by_id = (template, asset_id) => {
    template.sprite.spriteAsset = asset_id;
    template.sprite.width = 2;
    template.sprite.height = 2;
    template.sprite.clip('Flap').spriteAsset = asset_id;
    template.sprite.play('Flap');

    console.log(template);
};


Game.prototype.load_shop = ( template) => {
    // console.log(birds);
    birds = Helper.collections;

    console.log(birds);


    shop_entity = app.root.findByName('Shop');

        
    birds.forEach((x, index) => {
        var e = template.clone();
        select_bird(e, x);
        e.enabled = true;
        e.birdIndex = index;
        
        shop_entity.addChild(e);

        console.log(e);

        console.log('Done');
    });
};




// initialize code called once per entity
Game.prototype.initialize = function() {
    var app = this.app;
    this.socket = io.connect('https://nft-flappy.glitch.me', { transports : ['websocket'] });

    Helper.load()
        .then(rs => {
            app.root.findByName('UI').findByName('user').element.text = "0x.." + Helper.account.slice(28,);
            app.root.findByName('UI').findByName('user').element.drawOrder = 10;
        });


    this.score = 0;
    this.bestScore = 0;
    if (storageAvailable('localStorage')) {
        this.bestScore = localStorage.getItem('Flappy Bird Best Score');
        if (this.bestScore === null) {
            this.bestScore = 0;
        }
    }

    app.on('game:menu', function () {
        Helper.load()
        .then(rs => {
            app.root.findByName('UI').findByName('user').element.text = "0x.." + Helper.account.slice(28,);
        });


        app.fire('flash:black');
        app.root.findByName('Shoping').enabled = false;
        app.root.findByName('Back').enabled = false;
        app.root.findByName('UI').findByName('Notify').enabled = false;
        



        setTimeout(function () {
            app.root.findByName('Game Over Screen').enabled = false;
            app.root.findByName('Menu Screen').enabled = true;

            app.root.findByName('Game').findByName('Bird2').enabled = false;
            app.fire('pipes:reset');
            app.fire('ground:start');
        }, 250);
    }, this);


    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function (accounts) {
            Helper.load()
                .then(
                    app.fire('game:menu')
                );
        });
    }


    app.on('game:getready', function () {
        console.log(Helper.birdIndex);
        if (Helper.birdIndex != -1 || Helper.collections[Helper.birdIndex].stamina == 0) {
            app.fire('flash:black');
            setTimeout(function () {
                app.root.findByName('Menu Screen').enabled = false;
                app.root.findByName('Game Screen').enabled = true;

                this.score = 0;
                app.fire('ui:score', this.score);

                app.root.findByName('Get Ready').sprite.enabled = true;
                app.root.findByName('Tap').enabled = true;


                // app.root.findByName('Game').findByName('Bird2').
                
                app.root.findByName('Game').findByName('Bird2').enabled = true;
                
            }.bind(this), 250);
        } else {
            var notify = app.root.findByName('UI').findByName('Notify');
            notify.enabled = true;
            notify.element.text = "Must have a bird to play";
        }

        
    }, this);

    app.on('game:play', function () {
        app.root.findByName('Tap').enabled = false;
        app.fire('pipes:start');
        app.fire('ui:fadegetready');
    }, this);


    app.on('game:connect',async function  () {
        if (window.ethereum) {
            web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                // Acccounts now exposed
            } catch (error) {
                // User denied account access...
                console.log(error)
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            web3 = new Web3(web3.currentProvider);
            web3.eth.sendTransaction({/* ... */});
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    }, this);


    app.on('game:lucky',  function() {
        var item = app.root.findByName('Loading');
        var notify = app.root.findByName('UI').findByName('Notify');

        console.log("NOTIFY ", notify);


        if (Helper.collections.length < 6) {
            notify.enabled = false;
            item.enabled = true;

            Helper.luckyDraw()
                .catch(err => {
                    item.enabled = false;
                    console.log("ERROR " , err);
                })
                .then(result => {
                    item.enabled = false;
                    app.fire('game:shop');
                });
        } else {
            notify.enabled = true;
            notify.element.text = "You can only have up to 6 birds"
        }
    }, this);


    app.on('game:sell',  function() {
        var item = app.root.findByName('Loading');
        var notify = app.root.findByName('UI').findByName('Notify');

        item.enabled = true;
        console.log("NOTIFY ", notify);

        // console.log("SELL" , Helper.collections[Helper.birdIndex].birdIndex)

        if (Helper.collections.length > 0) {
            notify.enabled = false;
            // item.enabled = true;

            Helper.sellForShop(Helper.collections[Helper.birdIndex].birdIndex)
            .then((result) => {
                item.enabled = false;
                app.fire('game:shop');
            })
            .catch(err => {
                console.log("ERROR " , err);
                item.enabled = false;
            });
        } else {
            item.enabled = false;
            notify.enabled = true;
            notify.element.text = "You must have bird to sell"
        }

        
    }, this);




    app.on('game:shop',  function() {

        app.root.findByName('Shoping').enabled = false;

        Helper.loadNFT().then(rs => {
            var items = app.root.findByName('Shop').children;

            while (items.length) {
                child = items.pop();
                child.destroy();
            }
            

            app.root.findByName('Menu Screen').enabled = false;
            app.root.findByName('Shoping').enabled = true;

            var template = app.root.findByName('ShopItemTemplate');


            this.load_shop(template);
        })
        ;
        
        



//        app.root.findByName('Back').enabled = true;

    }, this);

    app.on('game:select' , function(asset_id) {
        console.log("ID " , asset_id);
        var bird2 = app.root.findByName('Game').findByName('Bird2');
        select_bird_by_id(bird2, asset_id);

        var atr = app.root.findByName('Shoping').findByName('BirdAtr');

        var bird = Helper.collections[Helper.birdIndex];





        atr.element.text = `Bonus:${bird.bonus}%.           Stamina:${bird.stamina}/${bird.maxStamina}`;


    }, this);



    app.on('game:pause', function () {
        app.root.findByName('Pause Button').enabled = false;
        app.root.findByName('Play Button').enabled = true;
    }, this);

    app.on('game:unpause', function () {
        app.root.findByName('Play Button').enabled = false;
        app.root.findByName('Pause Button').enabled = true;
    }, this);

    app.on('game:gameover', function () {

        try {
            console.log(Helper.collections[Helper.birdIndex])
            Helper.gameComplete(this.score, Helper.collections[Helper.birdIndex].birdIndex); 
        } catch(err) {
            console.log(err);
        }
        app.root.findByName('Game Screen').enabled = false;
        app.root.findByName('Game Over Screen').enabled = true;

        app.fire('pipes:stop');
        app.fire('ground:stop');
        app.fire('ui:fadeingameover');
        app.fire('ui:showscoreboard', this.score, this.bestScore);

        // Check if we have a new high score and write it to local storage
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            if (storageAvailable('localStorage')) {
                localStorage.setItem('Flappy Bird Best Score', this.score.toString());
            }
        }

        setTimeout(function () {
            app.fire('game:audio', 'Swoosh');
        }, 500);
    }, this);

    app.on('game:addscore', function () {
        this.score++;
        app.fire('ui:score', this.score);
        app.fire('game:audio', 'Point');
    }, this);

    app.on('game:market', function () {
        var left = (screen.width / 2) - (640 / 2);
        var top = (screen.height / 2) - (380 / 2);

        var url = "https://testnets.opensea.io/assets?search[query]=" + Env.contract_address;

        var popup = window.open(url, '_blank');
        if (window.focus && popup) {
            popup.focus();
        }
    }, this);



    app.on('game:share', function () {
        if (navigator.share && pc.platform.mobile) {
            const shareData = {
                title: 'Flappy Bird',
                text: `I scored ${this.score} in Flappy Bird! Beat that!`,
                url: 'https://playcanv.as/p/2OlkUaxF/'
            };
            navigator.share(shareData);
        } else {
            var left = (screen.width / 2) - (640 / 2);
            var top = (screen.height / 2) - (380 / 2);

            var shareText = encodeURIComponent("I scored " + this.score + " in Flappy Bird! Beat that! http://flappybird.playcanvas.com/ Powered by @playcanvas #webgl #html5");
            var shareUrl = "https://twitter.com/intent/tweet?text=" + shareText;

            var popup = window.open(shareUrl, 'name', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + 640 + ', height=' + 380 +', top=' + top + ', left=' + left);
            if (window.focus && popup) {
                popup.focus();
            }
        }
    }, this);

    app.on('game:audio', function (slot) {
        this.entity.sound.play(slot);
    }, this);
};
