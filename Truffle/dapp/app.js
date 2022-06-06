require("dotenv").config()

const Web3 = require('web3');
const Contract = require('@truffle/contract');

app = {}

const loadWeb3 = async () => {
    app.provider = new Web3.providers.WebsocketProvider(process.env.WEB3_PROVIDER);
    app.web3 = new Web3(app.provider);
}

const load_contract = (name, abi_path) => {
    var fs = require('fs');
    var jsonFile =abi_path;
    var parsed= JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    app[name] = new app.web3.eth.Contract(abi, process.env.USER_CONTACT_ADDRESS);
}

const load_account = () => {
    app.account = app.web3.eth.accounts.privateKeyToAccount(process.env.DEV_ACCOUNT_PRIVATE);
}

const load = () => {
    loadWeb3();
    load_contract("User",process.env.USER_ABI_PATH);
    load_account();
}

load()


app.User.events.UserCreated({}, (err, event) => {
    console.log(app.account);
    app.web3.eth.sendTransaction({from: app.account.address,to: event.returnValues.player, value: app.web3.utils.toWei("10", "ether")})
});