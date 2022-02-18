require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: {
    version: "0.8.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
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