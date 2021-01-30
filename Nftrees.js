import web3 from "./web3";
const Nftrees = require("./build/contracts/Nftrees.json");

// This creates an interface for us to interact with the contract
// using our infura node..
const instance = new web3.eth.Contract(
  Nftrees.abi,
  "0x6A502B1EeE2D1BF5f3AEDF317a85C096A0De7E44"
);

export default instance;
