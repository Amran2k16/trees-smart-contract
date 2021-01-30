import Web3 from "web3";
let web3;
const provider = new Web3.providers.HttpProvider(
  "https://rinkeby.infura.io/v3/df35c1cd958b4cdd884bd17c1c98df2c"
);
web3 = new Web3(provider);

export default web3;
