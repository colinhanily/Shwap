const fs = require('fs');
const path = require('path');

async function main() {
    const [owner, From, To] = await ethers.getSigners();
    // We get the contract to deploy
    const Dai = await ethers.getContractFactory("Dai");
    const dai = await Dai.deploy();
    console.log("Dai:", dai.address);
    console.log(owner.address);
    const mint = await dai.faucet(From.address, 100000000000000);

    const PartySwap = await ethers.getContractFactory("PartySwap");
    const partySwap = await PartySwap.deploy();
    const allow = await dai.connect(From).approve(partySwap.address, 1000000000)
    var createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 1000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 11000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 12000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 13000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 14000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 15000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 16000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 17000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 18000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 19000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 10000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 11000, 1000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 99000, 1000, 2, true)
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
