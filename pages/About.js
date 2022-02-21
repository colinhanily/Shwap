import 'bootstrap/dist/css/bootstrap.css';
import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import styles from '../styles/PartySwap.module.css'
import Header from '../components/Header';


function About() {

    const text1 = "PartySwap is a fully decentralised protocol for trustless peer to peer ERC20 token swaps."
    const text2 = "1. Alice creates a swap with Bob using the PartySwap contract"
    const space = ""
    const text3 = "2. Alice and Bob both deposit there tokens to the contract"
    const text5 = "3. Alice and Bob can now withdraw each others tokens"
    const text4 = "4. Once Alice has withdrawn Bobs tokens, she can no longer withdraw her own tokens, leaving them for Bob to withdraw, and vice versa"

    return (
        <div className={styles.PartySwapPage}>
            <Header></Header>
            <Container className="justify-content-center">
                {text1}<br/><br/>
                {text2}<br/>
                {text3}<br/>
                {text4}<br/>
                {text5}<br/>
            </Container>
        </div>
    )
}

export default About;