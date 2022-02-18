const fs = require('fs');
const path = require('path');

async function main() {
    const [owner, From, To] = await ethers.getSigners();
    // We get the contract to deploy
    const Dai = await ethers.getContractFactory("Dai");
    const dai = await Dai.deploy();
    console.log("Dai:", dai.address);
    console.log(owner.address);
    const mint = await dai.faucet(From.address, 10000000000000);

    const PartySwap = await ethers.getContractFactory("PartySwap");
    const partySwap = await PartySwap.deploy();
    const allow = await dai.connect(From).approve(partySwap.address, 90000000000000)
    var createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 10000000, 10000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 110000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 120000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 130000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 140000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 150000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 160000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 170000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 180000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 190000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 100000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 110000000, 100000000, 2, true)
    createSwap =  await partySwap.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 9, 100000000, 2, true)
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
