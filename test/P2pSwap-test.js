const { expect } = require("chai");
const { ethers } = require("hardhat");
const web3 = require("web3")

describe("Dummy Token", async function () {
  var owner;
  var from;
  var to;
  var attacker;
  var Dai;
  var dai;
  var PartySwap;
  var partySwap;

  it("Completes the swap process", async function () {
    //from - dai
    //to - eth
    var [owner, from, to, attacker] = await ethers.getSigners();
    var Dai = await ethers.getContractFactory("Dai");
    var dai = await Dai.deploy();
    await dai.deployed();

    var PartySwap = await ethers.getContractFactory("ParytSwap");
    var partySwap = await PartySwap.deploy();
    await partySwap.deployed();

    var amount = "1000000";
    var mint = await dai.connect(from).faucet(from.address, amount);
    await mint.wait();

    const minterBalance = await dai.balanceOf(from.address);
    expect(minterBalance).to.equal('1000000');    

    const from_Dai_Approve_Contract = await dai.connect(from).approve(partySwap.address, 1000000)

    const createSwap = await partySwap.connect(from).createSwap(from.address, to.address, dai.address, "0x0000000000000000000000000000000000000000", 1000000, 1000000, 2, true)
    createSwap.wait(); 

    var first_swap_struct = await partySwap.swaps_id_details_getter(0);
    expect(first_swap_struct).to.exist;

    ////////from deposit
    //var from_deposit = await partySwap.connect(from).from_deposit(0)
    //from_deposit.wait();
    //first_swap_struct = await partySwap.swaps_id_details_getter(0);
    //console.log(first_swap_struct);
    //expect(first_swap_struct[19]).to.equal("true");

    //////////to deposit
    var to_options = { value: "1000000" };
    var to_deposit = await partySwap.connect(to).to_deposit(0, to_options);
    to_deposit.wait();
   
    first_swap_struct = await partySwap.swaps_id_details_getter(0);
    console.log(first_swap_struct);

    ///////// from withdraw - dai
    let from_withdraw_to_tokens = await partySwap.connect(from).from_withdraw_to_tokens(0);
    from_withdraw_to_tokens.wait();
    first_swap_struct = await partySwap.swaps_id_details_getter(0);
    console.log(first_swap_struct);
    let confirm_from_received = await ethers.provider.getBalance(from.address);
    console.log(confirm_from_received);


    ///////// to withdraw - eth
    let to_withdraw_from_tokens = await partySwap.connect(to).to_withdraw_from_tokens(0);
    to_withdraw_from_tokens.wait();
    first_swap_struct = await partySwap.swaps_id_details_getter(0);
    let confirm_to_received = await dai.balanceOf(to.address);
    console.log(first_swap_struct);
    console.log(confirm_to_received);
    expect(confirm_to_received).equals("992500");


    let admin_withdraw_accrued_fees_eth = await partySwap.connect(owner).admin_withdraw_accrued_fees(1, "0x0000000000000000000000000000000000000000");
    let admin_withdraw_accrued_fees_dai = await partySwap.connect(owner).admin_withdraw_accrued_fees(1, dai.address );

    console.log(await dai.balanceOf(owner.address));
    console.log(await ethers.provider.getBalance(owner.address));
      
    let admin_switch_addr = await partySwap.connect(owner).switch_admin_address(from.address);
    console.log(await partySwap.admin());
  })
});
