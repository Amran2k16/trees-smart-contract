const BN = require("bn.js");
const chai = require("chai");
const expect = require("chai").expect;
chai.use(require("chai-bn")(BN));
const Nftrees = artifacts.require("Nftrees");

contract("Testing Basic functions", async (accounts) => {
  let instance;
  beforeEach(async () => {
    instance = await Nftrees.deployed();
  });

  it("should deploy the contract", async () => {
    expect(instance.address).to.not.equal("");
  });

  it("owner should be able to change the cap on the nfts", async () => {
    await instance.setCap(105, { from: accounts[0] });
    const newCap = new BN(await instance.getCap());
    expect(newCap).to.be.bignumber.that.equals(new BN(105));
  });

  it("should mint an NFT when someone purchases one", async () => {
    await instance.buyItem({
      from: accounts[0],
      value: web3.utils.toWei("0.2", "ether"),
    });
    const totalSupply = new BN(await instance.totalSupply());
    expect(totalSupply).to.be.a.bignumber.that.equals(new BN(1));
  });

  it("should fail to mint an NFT if 0.2 ether is not passed in exactly", async () => {
    try {
      await instance.buyItem({
        from: accounts[0],
        value: web3.utils.toWei("0.3", "ether"),
      });
      throw new Error("Succesfully minted...");
    } catch (e) {
      expect(e.message).to.not.equal("Succesfully minted...");
    }
  });

  it("should fail to mint an NFT if 0.2 ether is not passed in exactly", async () => {
    try {
      await instance.buyItem({
        from: accounts[0],
        value: web3.utils.toWei("0.2001", "ether"),
      });
      throw new Error("Succesfully minted...");
    } catch (e) {
      expect(e.message).to.not.equal("Succesfully minted...");
    }
  });

  it("should have a variable holding the maximum number of mintable nfts", async () => {
    const maxSupply = new BN(await instance.getCap());
    expect(maxSupply).to.be.a.bignumber.that.equals(new BN(105));
  });

  it("should remove roughly 0.2 ether from buyers account on purchase", async () => {
    const balanceBefore = new BN(await web3.eth.getBalance(accounts[1]));
    await instance.buyItem({
      from: accounts[1],
      value: web3.utils.toWei("0.2", "ether"),
    });
    const cost = new BN(web3.utils.toWei("0.2", "ether"));
    const balanceAfter = new BN(await web3.eth.getBalance(accounts[1]));
    expect(balanceAfter).to.be.a.bignumber.that.is.lessThan(
      balanceBefore.sub(cost)
    );
  });
});

contract("Testing Maximum minting limits", async (accounts) => {
  let instance;
  beforeEach(async () => {
    instance = await Nftrees.deployed();
  });

  it("owner should be able to change the cap on the nfts", async () => {
    await instance.setCap(10, { from: accounts[0] });
    const newCap = new BN(await instance.getCap());
    expect(newCap).to.be.bignumber.that.equals(new BN(10));
  });

  it("should be able to mint a maxSupply of NFTs", async () => {
    const cap = new BN(await instance.getCap());
    for (let i = 0; i < cap; i++) {
      await instance.buyItem({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether"),
      });
    }
    const totalSupply = new BN(await instance.totalSupply());
    expect(totalSupply).to.be.a.bignumber.that.equals(cap);
  });

  it("should fail if it tries to mint more than the maxSupply of nfts", async () => {
    try {
      await instance.buyItem({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether"),
      });
      throw new Error(`Expected an error and didn't get one!`);
    } catch (e) {
      // The test will pass if the try block threw an error
      // that has a message saying there was an evm exception
      expect(e.message).to.not.equal("Expected an error and didn't get one!");
      //If the error message is something else it will fail
      // e.g if the line above catch is thrown...
    }
  });
});

contract("Ensure that contract owner gets paid", async (accounts) => {
  let instance;
  beforeEach(async () => {
    instance = await Nftrees.deployed();
  });

  //   Web3 returns a bignumber, we need to keep it as it is so cast to new BN
  // use the BN library and the functions inside of it...
  it("should pay 0.2 eth to the owner on purchase", async () => {
    await instance.setCap(10, { from: accounts[0] });
    const balanceBefore = new BN(await web3.eth.getBalance(accounts[0])); //is a BN
    await instance.buyItem({
      from: accounts[1],
      value: web3.utils.toWei("0.2", "ether"),
    });
    const cost = new BN(web3.utils.toWei("0.2", "ether"));
    const balanceAfter = new BN(await web3.eth.getBalance(accounts[0]));
    expect(balanceAfter).to.be.bignumber.that.equals(balanceBefore.add(cost));
  });
});

contract(
  "Ensure that contract owner gets paid for all transactions",
  async (accounts) => {
    let instance;
    beforeEach(async () => {
      instance = await Nftrees.deployed();
    });

    //   Web3 returns a bignumber, we need to keep it as it is so cast to new BN
    // use the BN library and the functions inside of it...
    it("should pay enough eth to the owner on purchase", async () => {
      await instance.setCap(105, { from: accounts[0] });
      const balanceBefore = new BN(await web3.eth.getBalance(accounts[0])); //is a BN
      for (let i = 0; i < 105; i++) {
        await instance.buyItem({
          from: accounts[1],
          value: web3.utils.toWei("0.2", "ether"),
        });
      }
      const cost = new BN(web3.utils.toWei("0.2", "ether"));
      const balanceAfter = new BN(await web3.eth.getBalance(accounts[0]));
      expect(balanceAfter).to.be.bignumber.that.equals(
        balanceBefore.add(cost.mul(new BN(105)))
      );
    });
  }
);

contract("Ensuring that the tokenURI is set properly", async (accounts) => {
  let instance;
  beforeEach(async () => {
    instance = await Nftrees.deployed();
    await instance.setCap(105, { from: accounts[0] });
  });

  it("should have a base uri", async () => {
    const baseURI = await instance.baseURI();
    expect(baseURI).to.not.be.empty;
  });

  it("Base uri must end with a /", async () => {
    const baseURI = await instance.baseURI();
    expect(baseURI[baseURI.length - 1]).to.equal("/");
  });

  //   Web3 returns a bignumber, we need to keep it as it is so cast to new BN
  // use the BN library and the functions inside of it...
  it("should return the base uri/token id", async () => {
    await instance.buyItem({
      from: accounts[1],
      value: web3.utils.toWei("0.2", "ether"),
    });
    let baseURI = await instance.baseURI();
    let totalSupply = new BN(await instance.totalSupply());
    let tokenUri = await instance.tokenURI(totalSupply.toNumber());

    console.log(`${baseURI}${totalSupply.toNumber()}`);
    expect(tokenUri).to.equal(`${baseURI}${totalSupply.toNumber()}`);

    await instance.buyItem({
      from: accounts[1],
      value: web3.utils.toWei("0.2", "ether"),
    });
    baseURI = await instance.baseURI();
    totalSupply = new BN(await instance.totalSupply());
    tokenUri = await instance.tokenURI(totalSupply.toNumber());
    console.log(`${baseURI}${totalSupply.toNumber()}`);
    expect(tokenUri).to.equal(`${baseURI}${totalSupply.toNumber()}`);
  });
});
