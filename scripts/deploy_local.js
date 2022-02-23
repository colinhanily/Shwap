const fs = require('fs');
const path = require('path');

async function main() {
    const [owner, From, To] = await ethers.getSigners();
    // We get the contract to deploy
    const Dai = await ethers.getContractFactory("Dai");
    const dai = await Dai.deploy();
    console.log("Dai:", dai.address);
    console.log(owner.address);
    const mint = await dai.faucet(From.address, ethers.utils.parseEther("100000000"));

    const PartySwap = await ethers.getContractFactory("PartySwap");
    const partySwap = await PartySwap.deploy();
    const allow = await dai.connect(From).approve(partySwap.address, ethers.utils.parseEther("900000"))
    var createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", ethers.utils.parseEther('100'), ethers.utils.parseEther('100'), 2, true);
    
    console.log("PartySwap deployed to:", partySwap.address);
    console.log("From Address", From.address);


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
