require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.6",
  networks: {
    hardhat: {},
    sbch: {
      url: "http://localhost:8545",
      gasPrice: 10000000000,
      gas: 2000000,
    }
  },
  mocha: {
    timeout: 200000,
  }
};