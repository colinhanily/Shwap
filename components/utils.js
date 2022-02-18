import Web3 from 'web3';
import PartySwap from '../artifacts/contracts/PartySwap.sol/PartySwap.json';
import ERC20 from '../artifacts/contracts/Dai.sol/Dai.json';

const getWeb3 = () => {
    try {
        return new Web3('http://localhost:8545')
    } catch (e) {
        console.log(e)
    }
};

const getPartySwap = async () => {
    const web3 = getWeb3();

    try {
        return new web3.eth.Contract(
            PartySwap.abi,
            PartySwap.address
        )
    } catch (e) {
        console.log(e)
    }
}; 

const checkIfTokenIsEth = (address) => {
    try {
        if (address == "0x0000000000000000000000000000000000000000")
            return true;
        else
            return false
    } catch (e) {
        return false
    }
}

const createSwap = async (currentAccount, counterPartyAddress, fromTokenAddress, toTokenAddress, fromAmount, toAmount, isEth, sendOnCreate) => {
    const partySwap = await getPartySwap();
    var decimals;
    var web3 = getWeb3();

    if (isEth == 0 || isEth == 1) {
        let fromDecimals = getERC20Decimals(fromTokenAddress)
        if (fromDecimals == '18') {
            fromAmount = web3.utils.toWei(fromAmount.toString());
            console.log("IsETH: " + isEth);
        } else {
            let append = +fromDecimals + +1;
            fromAmount = fromAmount.toString().padEnd(parseInt(append), "0");
        }
        toAmount = web3.utils.toWei(toAmount.toString());           
    }

    if (isEth == 0 || isEth == 2) {
        let toDecimals = await getERC20Decimals(toTokenAddress);
        
        if (toDecimals == '18') {
            toAmount = web3.utils.toWei(toAmount.toString());                        
        } else {
            toAmount = web3.utils.padRight(toAmount.toString(), decimals)
        let append = +toDecimals + +1;
            toAmount = toAmount.toString().padEnd(parseInt(append), "0");
        }
        fromAmount = web3.utils.toWei(fromAmount.toString());
    }

    counterPartyAddress = counterPartyAddress.trim();
    sendOnCreate = +sendOnCreate;

    try {
        await partySwap.methods.createSwap(currentAccount, counterPartyAddress, fromTokenAddress, toTokenAddress, fromAmount, toAmount, isEth, sendOnCreate).send({from: currentAccount});
        return true
    } catch (e) {
        console.log(e)
        return false
    }
}

const deposit = async (currentAccount, swapDetails) => {
    const web3 = getWeb3();
    const partySwap = await getPartySwap();
    let isEth = swapDetails.isEth;

    try {
        if (currentAccount.toLowerCase() == swapDetails.swapInitiator.toLowerCase()) {
            if (isEth == 1) {
                await partySwap.methods.from_deposit(swapDetails.swapId).send({from: currentAccount,
                                                                               value: web3.utils.toWei(swapDetails.decimalYouSend)});
                } else {
                await partySwap.methods.from_deposit(swapDetails.swapId).send({from: currentAccount});
                }
        } else {
            if (isEth == 2) {
                await partySwap.methods.to_deposit(swapDetails.swapId).send({from: currentAccount,
                                                                               value: web3.utils.toWei(swapDetails.decimalYouSend)});
            } else {
                await partySwap.methods.to_deposit(swapDetails.swapId).send({from: currentAccount});
            }
        }
    } catch (e) {
        console.log(e)
        return false;
    }
}

const withdrawOwnTokens = async (currentAccount, swapDetails) => {
    console.log("Initiator")
    console.log(swapDetails.swapInitiator)
    console.log("YourAddress")
    console.log(currentAccount)

    console.log
    const partySwap = await getPartySwap();
    console.log(swapDetails)
    try {
        if (currentAccount.toLowerCase() == swapDetails.swapInitiator.toLowerCase()) {
            await partySwap.methods.from_withdraw_own_tokens(swapDetails.swapId).send({from: currentAccount});
            
        } else {
            await partySwap.methods.to_withdraw_own_tokens(swapDetails.swapId).send({from: currentAccount});
        }
    } catch (e) {
        console.log(e)
        return false;
    }
}

const withdrawCounterPartyTokens = async (currentAccount, swapDetails) => {
    const partySwap = await getPartySwap();
    try {
        if (currentAccount.toLowerCase() == swapDetails.swapInitiator.toLowerCase())
            await partySwap.methods.from_withdraw_to_tokens(swapDetails.swapId).send({from: currentAccount});
            
        else
            await partySwap.methods.to_withdraw_from_tokens(swapDetails.swapId).send({from: currentAccount});
    } catch (e) {
        console.log(e)
        return false;
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
        var decimals = await tokenContract.methods.decimals().call();
    } catch (e) {
        console.log(e)
        return false;
    }
    return true;
}

const getERC20Decimals = async (address) => {
    try {
        if (address == "0x0000000000000000000000000000000000000000") 
            return '18';
        let tokenContract = await getERC20(address);
        let decimals = await tokenContract.methods.decimals().call();
        console.log(decimals)
        return decimals
    } catch (e) {
        console.log(e)
    }
}

const isValidAddress = (addr) => {
    const web3 = getWeb3();
    let address = addr.trim()
    if (web3.utils.isAddress(addr) == false)
        return false
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
            if (await checkTokenIsApproved(currentAccount, address) === false) {
                let tokenContract = await getERC20(address);
                let approve = await tokenContract.methods.approve(PartySwap.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").send({from: currentAccount});
                console.log(approve)
            }
            return true;
        } catch (e) {
            console.log(e)
            return false
        }
    }
    return false
}

const checkTokenIsApproved = async (currentAccount, fromToken) => {
    if (await isToken(fromToken) === true) {
        try {
            if (fromToken == "0x0000000000000000000000000000000000000000")
                return true
            let tokenContract = await getERC20(fromToken);
            let isApproved = await tokenContract.methods.allowance(currentAccount, PartySwap.address).call();
            console.log(isApproved)
            if (isApproved > 100000)
                return true;
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

    try {
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
    } catch (e) {
        console.log(e)
        return []
    }
    return swapsArray;
}

const convertAmountToDecimal = async (address, amount) => {
    const web3 = getWeb3();
        try {
            if (address === "0x0000000000000000000000000000000000000000")
                return web3.utils.fromWei(amount.toString());

            let decimals = await getERC20Decimals(address)

            if (decimals === '18' || isNaN(decimals) === true) {
                return web3.utils.fromWei(amount.toString());
            } else {            
                return (amount * 10**-decimals).toString();
            }
        } catch (e) {
            console.log(e)
        }
}

async function formatUserSwaps(current_account, userSwaps) {
    var formattedSwapsArr = new Array()
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
    
        let decimalYouSend = await convertAmountToDecimal(userSwap[fromToken], userSwap[fromAmount]);
        let decimalYouReceive = await convertAmountToDecimal(userSwap[toToken], userSwap[toAmount]);

        fee = fee / 100;

        let isEth = userSwap[isEth];
        let youSend = decimalYouSend.concat(' ').concat(fromTokenSymbol);
        let youReceive = decimalYouReceive.concat(' ').concat(toTokenSymbol);
        let counterPartyAddress = userSwap[toIndex];
        let youDeposited = userSwap[fromDeposited].toString();
        let counterPartyDeposited = userSwap[toDeposited].toString();
        let toComplete = userSwap[toComplete];
        let fromComplete = userSwap[fromComplete];
        let fromStatus = userSwap[fromComplete];
        let toStatus = userSwap[toComplete];

        if (fromComplete == false || toComplete == false)
            swapStatus = "Incomplete";
        else
            swapStatus = "✅";

        if (toComplete == true){
            counterPartyStatus = "✅"
        } else if (toComplete.toString() == "false" && counterPartyDeposited.toString() == "true") {
            counterPartyStatus = "Deposited"
        } else {
            counterPartyStatus = "Yet To Deposit"   
        }

        let swapFormmatted = {send: youSend, receive: youReceive, counterParty: counterPartyAddress,
                              youDeposit: youDeposited, counterPartyStatus: counterPartyStatus, fees: fee,
                              status: swapStatus, fromSymbol: fromTokenSymbol.toString(), toSymbol: toTokenSymbol.toString(),
                              swapId: userSwap['swapId'], swapInitiator: userSwap.from, decimalYouSend: decimalYouSend,
                              decimalYouReceive: decimalYouReceive, isEth: isEth, fromComplete: fromComplete, toComplete: toComplete, counterPartyDeposit: counterPartyDeposited};
        formattedSwapsArr.push(swapFormmatted);
    }
    
    formattedSwapsArr = formattedSwapsArr.reverse();
    
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

const connectWalletHandler = async (e) => {
    const { ethereum } = window;

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

export { getWeb3, getPartySwap, connectWalletHandler, walletChanges, getERC20, isToken,
         isValidAddress, createSwap, approveToken, checkTokenIsApproved, getUserSwaps,
         formatUserSwaps, checkIfTokenIsEth, deposit, withdrawCounterPartyTokens, withdrawOwnTokens}
