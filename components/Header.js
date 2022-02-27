import styles from '../styles/Header.module.css'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { connectWalletHandler } from '../components/utils';
import { Container, Modal } from 'react-bootstrap';

const Header = () => {    
    const [connectButton, setConnectButton] = useState("Connect Wallet");
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showHowToModal, setShowHowToModal] = useState(false);

    const handleCloseAbout = () => setShowAboutModal(false);
    const handleShowAbout = () => setShowAboutModal(true);
    const handleCloseHowTo = () => setShowHowToModal(false);
    const handleShowHowTo = () => setShowHowToModal(true);

    async function getWalletAddr(e)
    {
        e.preventDefault();

        let account = await connectWalletHandler();
        if (account != undefined)
            setConnectButton(account.substring(0,4) + "..." + account.substring(account.length -4))
    }

    async function getWalletAddrRefresh()
    {
        let account = await connectWalletHandler();
        if (account != undefined)
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
                    <Nav.Link className={styles.About} onClick={handleShowAbout}>About</Nav.Link>
                    <Nav.Link className={styles.About} onClick={handleShowHowTo}>How To</Nav.Link>
                </Nav>
                <Modal
                    show={showAboutModal}
                    onHide={handleCloseAbout}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                    <Modal.Title>About PartySwap</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        PartySwap is a decentralised protocol for trustless peer to peer ERC20 token swaps.
                        <br/>
                        <br/>
                        It was created after seeing a twitter user swap large amounts of tokens and trusting that the counterparty would not run off with them (which they luckily didn't).
                        <br/>
                        <br/>
                        Simple peer to peer swapping functionality is a fundamental feature made possible by the EVM
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleCloseAbout}>
                        Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal
                    show={showHowToModal}
                    onHide={handleCloseHowTo}
                    backdrop="static"
                    keyboard={false}
                    size="md"
                >
                    <Modal.Header closeButton>
                    <Modal.Title>How To Use PartySwap</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        1. Fill in the Swap details in the form provided.
                        <br/>
                        <br/>
                        2. Approve the token you wish to deposit.
                        <br/>
                        <br/>
                        3. Click create swap to create a swap contract with the &nbsp;&nbsp;&nbsp;&nbsp;counterparty.
                        <br/>
                        <br/>
                        4. Deposit your side of the trade.
                        <br/>
                        <br/>
                        5. Once the counterparty has deposited their side of the trade, &nbsp;&nbsp;&nbsp; you can now withdraw their tokens.
                        <br/>
                        <br/>
                        6. Once you have withdrawn the counterparties tokens, you &nbsp;&nbsp;&nbsp;&nbsp;will lose access to your tokens to ensure the counterparty can &nbsp;&nbsp;&nbsp;&nbsp;safely withdraw your tokens.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleCloseHowTo}>
                        Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Link href="/" passHref>
                    <Navbar.Brand className={styles.Brand} href>PartySwap 💰</Navbar.Brand>
                </Link>
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
