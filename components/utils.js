import Web3 from 'web3';
import PartySwap from '../artifacts/contracts/PartySwap.sol/PartySwap.json';
import ERC20 from '../artifacts/contracts/Dai.sol/Dai.json';
const { ethers }  = require('ethers');

const getWeb3 = () => {
    return new Web3('http://localhost:8545')
};

const getPartySwap = async () => {
    const web3 = getWeb3();
    console.log(PartySwap.abi)
    console.log(PartySwap.address)
    return new web3.eth.Contract(
        PartySwap.abi,
        PartySwap.address
    )
}; 

const createSwap = async (currentAccount, counterPartyAddress, fromToken, toToken, fromAmount, toAmount, isEth, sendOnCreate) => {
    const partySwap = await getPartySwap();

    try {
        let x = await partySwap.methods.createSwap(currentAccount, counterPartyAddress, fromToken, toToken, fromAmount, toAmount, isEth, sendOnCreate).send({from: currentAccount});
        return true
    } catch (e) {
        console.log(e)
        return false
    }
}

const isToken = async (address) => {
    try {
     
        if (address == "0x0000000000000000000000000000000000000000")
            return true;

        let tokenContract = await getERC20(address);
        var symbol = await tokenContract.methods.symbol().call();
        var totalSupply = await tokenContract.methods.totalSupply().call();
        var name = await tokenContract.methods.name.call();
        var decimals = await tokenContract.methods.decimals.call();
    } catch (e) {
        console.log(e)
        return false;
    }
    return true;
}

const isValidAddress = (addr) => {
    let address = addr.trim()
    if (address.substring(0,2) != '0x')
        return false
    if (address.length != 42)
        return false
    if (address.match("[A-Za-z0-9]+$"))
        return true
}

const approveToken = async (currentAccount, address) => {
    if (await isToken(address) === true) {
        try {
            if (await checkTokenIsApproved(currentAccount, address) == false) {
                let tokenContract = await getERC20(address);
                let approval = await tokenContract.methods.approve(PartySwap.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").send({from: currentAccount});
                return true;
            }
            return false;
        } catch (e) {
            console.log(e)
            return false
        }
    }
}

const checkTokenIsApproved = async (currentAccount, fromToken) => {
    if (await isToken(fromToken) === true) {
        try {
            if (token == "0x0000000000000000000000000000000000000000")
                return true
            let tokenContract = await getERC20(fromToken);
            let isApproved = await tokenContract.methods.allowance(PartySwap.address, currentAccount).call();
            if (isApproved > 100000) {
                console.log(isApproved)
                return true
            }

            return false;
        } catch (e) {
            console.log(e)
            return false
        }
    } 
}

async function getERC20(addr) {
    try {
        let address = addr.toString().trim()
        const web3 = getWeb3();
        let tokenContract = new web3.eth.Contract(ERC20.abi, address);
        return tokenContract;
    } catch (e) {
        console.log(e)
        return false;
    }
}

async function getUserSwaps(currentAccount) {
    if (currentAccount == undefined) {
        return null;
    }

    let partySwap = await getPartySwap();
    let userSwapsFrom = await partySwap.getPastEvents('swapCreated', {
        filter: {from: currentAccount},
        fromBlock: 0,
        ToBlock: 'latest'
      });

    let userSwapsTo = await partySwap.getPastEvents('swapCreated', {
        filter: {to: currentAccount},
        fromBlock: 0,
        ToBlock: 'latest'
      });

    var swapsArray = [];
    
    for (let i = 0; i < userSwapsTo.length; i++) {
        let swapData = await partySwap.methods.swaps_id_details_getter(userSwapsTo[i].returnValues.current_swap_id).call();
        let swapNumber = userSwapsTo[i].returnValues.current_swap_id;
        let swap = {swapId : swapNumber};
        Object.assign(swap, swapData);
        swapsArray.push(swap);
    }

    for (let i = 0; i < userSwapsFrom.length; i++) {
        let swapData = await partySwap.methods.swaps_id_details_getter(userSwapsFrom[i].returnValues.current_swap_id).call();
        let swapNumber = userSwapsFrom[i].returnValues.current_swap_id;
        let swap = {swapId : swapNumber};
        Object.assign(swap, swapData);
        swapsArray.push(swap);
    }

    console.log(swapsArray)

    return swapsArray;
}

async function formatUserSwaps(current_account, userSwaps) {
    var formattedSwapsArr = [];
    var fromIndex;
    var toIndex;
    var fromToken;
    var toToken;
    var fromAmount;
    var toAmount;
    var fee;
    var fromDeposited;
    var toDeposited;
    var fromComplete;
    var toComplete;
    var isEth;
    var swapStatus;
    var counterPartyStatus;
    console.log("HELLO")
    console.log(userSwaps);
    
    for (let i = 0; i < userSwaps.length; i++) {
        let userSwap = userSwaps[i];
        
        if (current_account.toLowerCase() === userSwap.from.toLowerCase()) {
            fromIndex = 0;
            toIndex = 1;
            fromToken = 2;
            toToken = 3;
            fromAmount = 4;
            toAmount = 5;
            fee = 6;
            fromDeposited = 7;
            toDeposited = 8;
            fromComplete = 9;
            toComplete = 10;
            isEth = 11;
        } else {
            fromIndex = 1;
            toIndex = 0;
            fromToken = 3;
            toToken = 2;
            fromAmount = 5;
            toAmount = 4;
            fee = 6;
            fromDeposited = 8;
            toDeposited = 7;
            fromComplete = 10;
            toComplete = 9;
            isEth = 11;
        }

        let fromTokenSymbol = await getTokenName(userSwap[fromToken]);
        let toTokenSymbol = await getTokenName(userSwap[toToken]);

        fee = fee / 100;

        let youSend = userSwap[fromAmount].concat(' ').concat(fromTokenSymbol);
        let youReceive = userSwap[toAmount].concat(' ').concat(toTokenSymbol);
        let counterPartyAddress = userSwap[toIndex];
        let youDeposited = userSwap[fromDeposited].toString();
        let counterPartyDeposited = userSwap[toDeposited].toString();
        let toComplete = userSwap[toComplete].toString();
        let fromStatus = userSwap[fromComplete];
        let toStatus = userSwap[toComplete];
        if (fromStatus === false || toStatus === false)
            swapStatus = "Incomplete";
        else
            swapStatus = "Complete";


        if (toComplete == true){
            counterPartyStatus = "Completed"
        } else if (toComplete == "false" && counterPartyDeposited == "true") {
            counterPartyStatus = "Deposited"
        } else {
            counterPartyStatus = "Yet To Deposit"   
        }

        let swapFormmatted = {send: youSend, receive: youReceive, counterParty: counterPartyAddress, youDeposit: youDeposited, counterPartyStatus: counterPartyStatus, fees: fee, status: swapStatus, fromSymbol: fromTokenSymbol.toString(), toTokenSymbol: toTokenSymbol.toString(), swapId: userSwap['swapId']};
        formattedSwapsArr.push(swapFormmatted);
    }
    
    formattedSwapsArr.sort((a,b) => a.swapId < b.swapId ? 1 : -1);
    console.log(formattedSwapsArr)
    
    return formattedSwapsArr;
}

async function getTokenName(address) {
    if (address == "0x0000000000000000000000000000000000000000") {
        return "ETH"
    } else {
        let tokenContract = await getERC20(address);
        let symbol = await tokenContract.methods.symbol().call();
        return symbol
    }   
}

const checkWalletIsConnected = async (e) => {
    //e.preventDefault();

    if (window.ethereum) {
        if (window.ethereum.isConnected()) {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setConnectButton(accounts[0].substring(0,4) + "...")
        } else {
            setConnectButton("Connect Wallet")
        }
        return;
    } else {
        console.log("No Wallet Connected");
    }
    
}

const connectWalletHandler = async (e) => {
    const { ethereum } = window;

    if (window.ethereum.isConnected()) {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    }

    if (!ethereum) {
        alert("Please install a web3 wallet!");
    }

    try {
        let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0];
    } catch (err) {
        console.log(err);
    }
}

const walletChanges = async () => {
    if (window.ethereum) {
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        })
        window.ethereum.on('accountsChanged', () => {
                window.location.reload();
        })
    }
}

export { getWeb3, getPartySwap, connectWalletHandler, walletChanges, getERC20, isToken, isValidAddress, createSwap, approveToken, checkTokenIsApproved, getUserSwaps, formatUserSwaps}
