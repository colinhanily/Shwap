import 'bootstrap/dist/css/bootstrap.css'; // Add this line
import React, { useEffect, useState } from 'react';
import { getWeb3, getPartySwap, walletChanges, getERC20, isToken, getUserSwaps, connectWalletHandler } from '../components/utils';
import styles from '../styles/PartySwap.module.css'
import Header from '../components/Header';
import CreateSwapForm from '../components/CreateSwapForm';
import MySwaps from '../components/MySwaps';

export default function PartySwap() {
  const [web3, setWeb3] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [partySwap, setPartySwap] = useState(undefined);
  const [currentSwapId, setCurrentSwapId] = useState(undefined);
  const [swapPresent, setSwapsPresent] = useState(false);
  const [swapCreated, setSwapCreated] = useState(false);
  
  useEffect(() => {
    console.log(swapCreated)
    const init = async () => {
      const web3 = getWeb3();
      //const accounts = await web3.eth.getAccounts();
      let account = await connectWalletHandler();
      const partySwap = await getPartySwap();
      const current_swap_id = await partySwap.methods.current_swap_id().call();
    
      const isERC20 = isToken("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");

      const token = await getERC20("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");


      let swaps = await getUserSwaps(account);

      if (swaps.length > 0)
        setSwapsPresent(true)
      else
        setSwapsPresent(false)


      walletChanges();
      
      setWeb3(web3);
      setAccount(account);
      setPartySwap(partySwap);
      setCurrentSwapId(currentSwapId);
    };
    init();
  }, []);


  function childCallback(value) {
    setSwapCreated(value)
  }

  if (swapPresent === false) {
    return (
      <div className={styles.PartySwapPage}>
        <Header/>
        <CreateSwapForm currentAccount={account}/>
      </div>
    ) 
  }

  if (
    typeof web3 === 'undefined'
    || typeof account === 'undefined'
    || typeof partySwap === 'undefined'
  ) {
    return <div>Loading...</div>;
  }
  
  if (swapPresent === true) {
    return (
      <div className={styles.PartySwapPage}>
        <Header/>
        <CreateSwapForm swapCreated={swapCreated} />
        <MySwaps swapCreated={childCallback}></MySwaps>
      </div>
    )
  }
}




































































/*import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'


export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}*/
