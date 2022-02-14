async function main() {
    const [owner, From, To] = await ethers.getSigners();

    // We get the contract to deploy
    const Dai = await ethers.getContractFactory("Dai");
    const dai = await Dai.deploy();
    console.log("Dai:", dai.address);
    console.log(owner.address);
    const mint = await dai.faucet(From.address, 1000);

    const P2p = await ethers.getContractFactory("P2pSwap");
    const p2p = await P2p.deploy();
    const allow = await dai.connect(From).approve(p2p.address, 1000000000)
    const createSwap =  await p2p.connect(From).createSwap(From.address, To.address, dai.address, "0x0000000000000000000000000000000000000000", 1000, 1000, 2, true)
    console.log("P2p deployed to:", p2p.address);
    console.log("From Address", From.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
