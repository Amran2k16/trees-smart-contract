const BN = require("bn.js");
const chai = require("chai");
const expect = require("chai").expect;
chai.use(require("chai-bn")(BN));
const Nftrees = artifacts.require("Nftrees");

contract("Testing the minting cap", async (accounts) => {
  let instance;
  beforeEach(async () => {
    instance = await Nftrees.deployed();
  });

  it("should have a cap on the maximum number of nfts that can be minted", async () => {
    await instance.setCap(105, { from: accounts[0] });
    const cap = new BN(await instance.getCap());
    expect(cap).to.be.bignumber.that.equals(new BN(105));
  });

  it("owner should be able to change the cap on the nfts", async () => {
    await instance.setCap(210, { from: accounts[0] });
    const newCap = new BN(await instance.getCap());
    expect(newCap).to.be.bignumber.that.equals(new BN(210));
  });

  it("should be able to set the cap to 420", async () => {
    await instance.setCap(420, { from: accounts[0] });
    const newCap = new BN(await instance.getCap());
    expect(newCap).to.be.bignumber.that.equals(new BN(420));
  });

  it("should throw an error if non-owner tries to change the cap", async () => {
    try {
      await instance.setCap(100, { from: accounts[1] });
      //the test should fail if this error is the one that is thrown
      throw new Error("Cap was set by a non-owner");
    } catch (e) {
      expect(e.message).to.not.equal("Cap was set by a non-owner");
    }
  });

  it("should throw an error if cap is set beyond 420", async () => {
    try {
      await instance.setCap(421, { from: accounts[0] });
      //the test should fail if this error is the one that is thrown
      throw new Error("Cap was set beyond 420");
    } catch (e) {
      expect(e.message).to.not.equal("Cap was set beyond 420");
    }
  });

  it("should disable minting (fail transaction) when cap is set to 0", async () => {
    try {
      await instance.setCap(0, { from: accounts[0] });
      await instance.buyItem({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether"),
      });
      // the test should fail if this error is the one that is thrown
      throw new Error("Sucessfully minted even though the cap was set to 0");
    } catch (e) {
      expect(e.message).to.not.equal(
        "Sucessfully minted even though the cap was set to 0"
      );
    }
  });

  it("should allow minting upto the new cap", async () => {
    await instance.setCap(50, { from: accounts[0] });
    let totalMinted = new BN(await instance.totalSupply());
    let cap = new BN(await instance.getCap());

    for (let i = totalMinted.toNumber(); i < cap.toNumber(); i++) {
      await instance.buyItem({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether"),
      });
    }

    totalMinted = new BN(await instance.totalSupply());
    const tokenURI = await instance.tokenURI(totalMinted.toNumber());
    console.log(tokenURI);
    expect(totalMinted).to.be.a.bignumber.that.equals(new BN(cap));

    await instance.setCap(100, { from: accounts[0] });
    cap = new BN(await instance.getCap());

    for (let j = totalMinted.toNumber(); j < cap.toNumber(); j++) {
      await instance.buyItem({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether"),
      });
    }
    totalMinted = new BN(await instance.totalSupply());
    expect(totalMinted).to.be.a.bignumber.that.equals(new BN(cap));
  });

  it("should allow minting of 420 NFTs", async () => {
    await instance.setCap(420, { from: accounts[0] });
    let totalMinted = new BN(await instance.totalSupply());
    let cap = new BN(await instance.getCap());

    for (let i = totalMinted.toNumber(); i < cap.toNumber(); i++) {
      await instance.buyItem({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether"),
      });
    }
    totalMinted = new BN(await instance.totalSupply());
    expect(totalMinted).to.be.a.bignumber.that.equals(new BN(420));
  });

  it("should throw error if you try to mint more than 420 NFTs", async () => {
    try {
      await instance.buyItem({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether"),
      });
      // the test should fail if this error is the one that is thrown
      throw new Error("Succesfully minted more than 420 nfts");
    } catch (e) {
      expect(e.message).to.not.equal("Succesfully minted more than 420 nfts");
    }
  });
});
