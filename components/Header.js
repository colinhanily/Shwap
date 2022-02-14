import styles from '../styles/Header.module.css'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import P2pSwap from '../artifacts/contracts/p2pswap.sol/P2pSwap.json';
import { connectWalletHandler } from '../components/utils';
import { Container } from 'react-bootstrap';

const classes = 'm-auto Nav'
const contractAddress = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";
const abi = P2pSwap.abi;
var walletConnected = true;


const Header = () => {    
    const [connectButton, setConnectButton] = useState("Connect Wallet");

  
    async function getWalletAddr(e)
    {
        e.preventDefault();

        let account = await connectWalletHandler();
        console.log("ACCCOUNT")
        console.log(account)
        setConnectButton(account.substring(0,4) + "..." + account.substring(account.length -4))
    }

    async function getWalletAddrRefresh()
    {
        let account = await connectWalletHandler();
        setConnectButton(account.substring(0,4) + "..." + account.substring(account.length -4))
    }



    useEffect(() => {
        if(window.ethereum) {
            window.ethereum.on('chainChanged', () => {
              window.location.reload();
            })
            window.ethereum.on('accountsChanged', () => {
              window.location.reload();
            })
        }
        
        const init = () => {
            getWalletAddrRefresh();
        };
        init();
    }, []);

    return (
        <Navbar className={styles.Navbar}>
            <Container fluid>
                <Nav>
                    <Nav.Link className={styles.About} href="/About">About</Nav.Link>
                </Nav>
                <Nav>
                <Link href="/" passHref>
                    <Navbar.Brand className={styles.Brand} href>PartySwap 💰</Navbar.Brand>
                </Link>
                </Nav>
                <Nav>
                    <div className='justify-content-end'>
                        <Button onClick={getWalletAddr} variant="outline-warning" className={styles.ConnectWallet} href="/">{connectButton}</Button>
                    </div>
                </Nav>
            
            </Container>
                
        </Navbar>
    )
}

export default Header;