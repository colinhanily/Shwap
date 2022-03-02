require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	networks: {
		hardhat: {
		},
		rinkeby: {
			url: "https://rinkeby.infura.io/v3/INSERT_API_KEY_HERE",
			accounts: ["INSERT_PRIVATE_KEY_HERE"]
		}
	},
	solidity: {
		compilers: [
			{
				version: "0.8.4",
			},
			{
				version: "0.5.0"
			}
		]
	},
	gasReporter: {
		currency: 'EUR',
		gasPrice: 85
	},
	etherscan: {
		// Your API key for Etherscan
		// Obtain one at https://etherscan.io/
		apiKey: "INSERT API KEY HERE"
	  },
};
