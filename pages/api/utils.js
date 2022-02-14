import P2pSwap from '../../artifacts/contracts/p2pswap.sol/P2pSwap.json';

const contractAddress = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";
const abi = P2pSwap.abi;


const checkWalletIsConnected = async () => {
    if (window.ethereum) {
        console.log("WALLET CONNECTED!")
        if (window.ethereum.isConnected()) {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            console.log("ACCOUNT: ", accounts[0]);
            setConnectButton(accounts[0].substring(0,12) + "...")
        } else {
            setConnectButton("Connect Wallet")
        }
        return;
    } else {
        console.log("NO Wallet Connected");
    }
}

const connectWalletHandler = async (e) => {
	const { ethereum } = window;
    if (window.ethereum.isConnected()) {
    	e.preventDefault();
    	return;
    }

    if (!ethereum) {
        alert("Please install a web3 wallet!");
    }

	if (window.ethereum.isConnected()) {
        return;
    }

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log("FOUND ACCOUNT: ", accounts[0]);
        setCurrentAccount(accounts[0]);
        return true;
    } catch (err) {
        console.log(err);
    }
}


const walletReload = async () => {
    if (window.ethereum)
		window.ethereum.on('chainChanged', () => {
	   	window.location.reload();
	})
	window.ethereum.on('accountsChanged', () => {
		window.location.reload();
	})
}


export default {walletReload, connectWalletHandler, checkWalletIsConnected};