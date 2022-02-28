import Web3 from 'web3';
import PartySwap from '../artifacts/contracts/PartySwap.sol/PartySwap.json';
import ERC20 from '../artifacts/contracts/Dai.sol/Dai.json';

const rinkebyAddress = "0xEe8520C902DfE6EAcd80C846a32b792CDd033E97";

const getWeb3 = async () => {
            if (window.ethereum) {
                try {
                    return window.ethereum;
                } catch (e) {
                    console.log(e)
                }
            } else if (window.web3) {
                return window.web3;
            } else {
                console.log('Must Install Metamask');
            }
};

const getPartySwap = async () => {
    const web3 = new Web3(await getWeb3());
    try {
        let contract =  new web3.eth.Contract(
            PartySwap.abi, rinkebyAddress
        )
        return contract;
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

const getTotalSwaps = async () => {
    try {
        let partySwap = await getPartySwap();
        let swapNumber = await partySwap.methods.current_swap_id().call();
        return swapNumber
    } catch (e) {
        console.log(e);
        return 0
    }
}

const createSwap = async (currentAccount, counterPartyAddress, fromTokenAddress, toTokenAddress, fromAmount, toAmount, isEth, sendOnCreate) => {
    const partySwap = await getPartySwap();
    var decimals;

    if (isEth == 0 || isEth == 1) {
        let fromDecimals = await getERC20Decimals(fromTokenAddress)
        if (fromDecimals == '18') {
            fromAmount = Web3.utils.toWei(fromAmount.toString());
        } else {
            let append = +fromDecimals + +1;
            fromAmount = fromAmount.toString().padEnd(parseInt(append), "0");
        }
        toAmount = Web3.utils.toWei(toAmount.toString());           
    }

    if (isEth == 0 || isEth == 2) {
        let toDecimals = await getERC20Decimals(toTokenAddress);
        
        if (toDecimals == '18') {
            toAmount = Web3.utils.toWei(toAmount.toString());                        
        } else {
            toAmount = Web3.utils.padRight(toAmount.toString(), decimals)
        let append = +toDecimals + +1;
            toAmount = toAmount.toString().padEnd(parseInt(append), "0");
        }
        fromAmount = Web3.utils.toWei(fromAmount.toString());
    }

    counterPartyAddress = counterPartyAddress.trim();
    sendOnCreate = +sendOnCreate;

    try {
        await partySwap.methods.createSwap(currentAccount, counterPartyAddress, fromTokenAddress, toTokenAddress, fromAmount.toString(), toAmount.toString(), isEth, sendOnCreate).send({from: currentAccount});
        return true
    } catch (e) {
        console.log(e)
        return false
    }
}

const deposit = async (currentAccount, swapDetails) => {
    const web3 = await getWeb3();
    const partySwap = await getPartySwap();
    let isEth = swapDetails.isEth;

    try {
        if (currentAccount.toLowerCase() == swapDetails.swapInitiator.toLowerCase()) {
            if (isEth == 1) {
                await partySwap.methods.from_deposit(swapDetails.swapId).send({from: currentAccount,
                                                                               value: Web3.utils.toWei(swapDetails.decimalYouSend)});
                } else {
                await partySwap.methods.from_deposit(swapDetails.swapId).send({from: currentAccount});
                }
        } else {
            if (isEth == 2) {
                await partySwap.methods.to_deposit(swapDetails.swapId).send({from: currentAccount,
                                                                             value: Web3.utils.toWei(swapDetails.decimalYouSend)});
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
    const partySwap = await getPartySwap();

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
        if (currentAccount.toLowerCase() == swapDetails.swapInitiator.toLowerCase()) {
            await partySwap.methods.from_withdraw_to_tokens(swapDetails.swapId).send({from: currentAccount});
        } else {
            await partySwap.methods.to_withdraw_from_tokens(swapDetails.swapId).send({from: currentAccount});
        }
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

        return decimals
    } catch (e) {
        console.log(e)
    }
}

const isValidAddress = (addr) => {
    let address = addr.trim()
    if (Web3.utils.isAddress(addr) == false)
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
                let approve = await tokenContract.methods.approve(rinkebyAddress, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").send({from: currentAccount});

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
            let isApproved = await tokenContract.methods.allowance(currentAccount, rinkebyAddress).call();

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
        const web3 = new Web3(await getWeb3());
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
        try {
            if (address === "0x0000000000000000000000000000000000000000")
                return Web3.utils.fromWei(amount.toString());

            let decimals = await getERC20Decimals(address)

            if (decimals === '18' || isNaN(decimals) === true) {
                return Web3.utils.fromWei(amount.toString());
            } else {            
                return (amount * 10**-decimals).toString();
            }
        } catch (e) {
            console.log(e)
        }
}

async function formatUserSwaps(current_account, userSwaps) {
    var formattedSwapsArr = new Array()
    var toIndex;
    var fromTokenIdx;
    var toTokenIdx;
    var fromAmount;
    var toAmount;
    var fromDeposited;
    var toDeposited;
    var isEthIdx;
    var swapStatus;
    var counterPartyStatus;
    
    for (let i = 0; i < userSwaps.length; i++) {
        let userSwap = userSwaps[i];
        
        if (current_account.toLowerCase() === userSwap.from.toLowerCase()) {
            toIndex = 1;
            fromTokenIdx = 2;
            toTokenIdx = 3;
            fromAmount = 4;
            toAmount = 5;
            fromDeposited = 7;
            toDeposited = 8;
            fromComplete = 9;
            toComplete = 10;
            isEthIdx = 11;
        } else {
            toIndex = 0;
            fromTokenIdx = 3;
            toTokenIdx = 2;
            fromAmount = 5;
            toAmount = 4;
            fromDeposited = 8;
            toDeposited = 7;
            fromComplete = 10;
            toComplete = 9;
            isEthIdx = 11;
        }

        let fromTokenSymbol = await getTokenName(userSwap[fromTokenIdx]);
        let toTokenSymbol = await getTokenName(userSwap[toTokenIdx]);
    
        let decimalYouSend = await convertAmountToDecimal(userSwap[fromTokenIdx], userSwap[fromAmount]);
        let decimalYouReceive = await convertAmountToDecimal(userSwap[toTokenIdx], userSwap[toAmount]);
        let fromTokenAddress = userSwap[fromTokenIdx];
        let fromTokenApproved = await checkTokenIsApproved(current_account, fromTokenAddress);

        let fee = (userSwap[6]) / 100;

        let isEth = userSwap[isEthIdx];
        let youSend = decimalYouSend.concat(' ').concat(fromTokenSymbol);
        let youReceive = decimalYouReceive.concat(' ').concat(toTokenSymbol);
        let counterPartyAddress = userSwap[toIndex];
        let youDeposited = userSwap[fromDeposited].toString();
        let counterPartyDeposited = userSwap[toDeposited].toString();
        let toComplete = userSwap[toComplete];
        let fromComplete = userSwap[fromComplete];


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
                              decimalYouReceive: decimalYouReceive, isEth: isEth, fromComplete: fromComplete, toComplete: toComplete, counterPartyDeposit: counterPartyDeposited, fromTokenAddress: fromTokenAddress, fromTokenApproved: fromTokenApproved};
        formattedSwapsArr.push(swapFormmatted);
    }
    
    
    return formattedSwapsArr.sort(sortFunction);
}

const sortFunction = (a, b) => {
    if (a.swapId == b.swapId) {
        return 0;
    } else {
        return (a.swapId > b.swapId) ? -1 : 1;
    }
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
    const web3 = await getWeb3();


    if (!ethereum) {
        alert("Please install a web3 wallet!");
    }

    try {
        let accounts = await web3.request({ method: 'eth_requestAccounts' });
        let walletId = window.ethereum.networkVersion;
        if (4 != walletId)
            alert("Incorrect Network, please connect to Rinkeby")
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
         formatUserSwaps, checkIfTokenIsEth, deposit, withdrawCounterPartyTokens, withdrawOwnTokens, getTotalSwaps}
