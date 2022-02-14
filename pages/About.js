import 'bootstrap/dist/css/bootstrap.css';
import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import styles from '../styles/PartySwap.module.css'
import Header from '../components/Header';


function About() {
    return (
        <div className={styles.PartySwapPage}>
            <Header></Header>
            <Container className="justify-content-center">
            YO
            </Container>
        </div>
    )
}

export default About;