const fs = require('fs');
const { ethers } = require('hardhat');
const path = require('path');
const { providers } = require('web3');

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("ACCOUNT: ", deployer.address)

    // We get the contract to deploy
    const PartySwap = await ethers.getContractFactory("PartySwap");
    const partySwap = await PartySwap.deploy();
//    const allow = await dai.connect(signer).approve(partySwap.address, ethers.utils.parseEther("900000"))
//    var createSwap =  await partySwap.connect(signer).createSwap(ess, To.address, dai.address, "0x0000000000000000000000000000000000000000", ethers.utils.parseEther('100'), ethers.utils.parseEther('100'), 2, true);
    
    console.log("PartySwap deployed to:", partySwap.address);

    const PartySwapArtifact = require("../artifacts/contracts/PartySwap.sol/PartySwap.json")
    PartySwapArtifact.address = partySwap.address;
    const data = JSON.stringify(PartySwapArtifact, null, 4);

    fs.writeFileSync('../' + path.basename(path.dirname(__dirname)) +  "/artifacts/contracts/PartySwap.sol/PartySwap.json", data, 'utf-8');
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });


//Dai: 0x89B19b467c207a88400Ed8cFAa9df1E5Ee63293a
//PartySwap deployed to: 0x0cA92183Dc9410F125738e68B72Efb8162dc664C