import React, { useEffect, useState } from 'react';
import styles from '../styles/MySwaps.module.css'
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Pagination, Spinner } from 'react-bootstrap';
import { connectWalletHandler, getUserSwaps, formatUserSwaps} from '../components/utils';

const MySwaps = () => {
    const [tableUserSwaps, setTableUserSwaps] = useState([]);
    const [tableUserSwapsPaginate, setTableUserSwapsPaginate] = useState([]);
    const [allPages, setAllPagesList] = useState([]);
    const [currentPagesList, setCurrentPagesList] = useState();
    const [activePage, setActivePage] = useState(1);


    const [loadingId, setLoadingId] = useState([]);


    const mockFetch = () =>
        new Promise((resolve) => {
        setTimeout(() => resolve(), 3000);
    });

    const clickHandler = async (e) => {
        const { id } = e.target;
        setLoadingId((ids) => ({
          ...ids,
          [id]: true
        }));
        try {
          await mockFetch();
        } catch {
          // ignore
        } finally {
          setLoadingId((ids) => ({
            ...ids,
            [id]: false
          }));
        }
      };

    
    useEffect(() => {
        async function getSwaps() {
           let account = await connectWalletHandler();
           let swaps = await getUserSwaps(account);
           let formattedSwaps = await formatUserSwaps(account, swaps);
           setTableUserSwaps(formattedSwaps);
           let items = getInitialPages(formattedSwaps);
           setCurrentPagesList(items.slice(0,5))
           let pageData = formatInitialTableData(formattedSwaps, 1);
           setTableUserSwapsPaginate(pageData)
        };
        getSwaps();
        
    }, []);

    async function deposit(index) {
        let arr = loadingId;
        arr[0] = true;
        //console.log(arr)
        setLoadingId(arr)
        //sleep(5000);
        //arr[0] = false

//        setButtonArray(true)

    }

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }
    

    const nextPageSetup = () => {
        let pageNumber = activePage;
        if (activePage < allPages.length)
            pageNumber += 1
            setActivePage(pageNumber);
        formatTableData(pageNumber)
        let lastIndex = currentPagesList.at(-1).key
        let newPagesList = allPages.slice(lastIndex - 1, lastIndex + 4)
        setCurrentPagesList(newPagesList)
    }

    const previousPageSetup = () => {
        let pageNumber = activePage;
        if (activePage > 1)
            pageNumber -= 1
            setActivePage(pageNumber);
        formatTableData(pageNumber)
        let lastIndex = currentPagesList.at(-1).key
        let newPagesList = allPages.slice(lastIndex - 4, lastIndex + 1)
        setCurrentPagesList(newPagesList)
    }

    const startPageSetup = () => {
        let newPagesList = allPages.slice(0, 5)
        setCurrentPagesList(newPagesList)
    }

    const lastPageSetup = () => {
        let newPagesList = allPages.slice(-5)
        setCurrentPagesList(newPagesList)
        
    }

    

    const getInitialPages = (swaps) => {
        let items = []

        for (let number = 1; number < (swaps.length / 10) + 1; number++)
            items.push(
            <Pagination.Item key={number} activeClassName={styles.MyPageButtons} onClick={() => {formatTableData(swaps, number)}} >
                {number}
            </Pagination.Item>
        );
        setAllPagesList(items);

        return items;
    }

    const renderPagination = () => {
        if (allPages.length > 0)
            return (<Pagination className={styles.MyPagination}>
                        { allPages > 3 && <Pagination.First onClick={() => startPageSetup()} />}
                        <Pagination.Prev onClick={() => previousPageSetup()}/>
                        <Pagination.Item onClick={() => nextPageSetup()}>
                        {activePage} of {allPages.length}
                        </Pagination.Item>
                        <Pagination.Next onClick={() => nextPageSetup()} />
                        {allPages > 3 && <Pagination.Last onClick={() => lastPageSetup()}/>}

                </Pagination>)

    }

    const formatInitialTableData = (pageData, number) => {
        let swaps = pageData.slice((number * 10) - 10, (number * 10));

        setTableUserSwapsPaginate(swaps);

        return swaps;
    }

    const formatTableData = (number) => {
        let swaps = tableUserSwaps.slice((number * 10) - 10, (number * 10));
        console.log(swaps);

        setTableUserSwapsPaginate(swaps);

        return swaps;
    }

    function renderYouDeposit(youDeposit, counterpartyDeposit, swapStatus, fromSymbol, toSymbol, length, idx) {
        if(youDeposit.toString() == "false") {
            return <td align='center'><Button id={idx} onClick={clickHandler} size="sm"> {loadingId[idx] ? <Spinner size="sm" animation="border" /> : ""} Deposit {fromSymbol}</Button></td>
        }

        if (youDeposit.toString() == "true" && swapStatus.toString() == "Incomplete" && counterpartyDeposit.toString() == "Deposited") {
            return <td align='center'><Button variant="success" size="sm"> {loadingId[idx] ? <Spinner size="sm" animation="border" /> : ""} Withdraw {fromSymbol}</Button>
                   <Button variant="danger" size="sm"> {loadingId[idx] ? <Spinner size="sm" animation="border" /> : ""}Withdraw {toSymbol}</Button></td>
        } else if (youDeposit.toString() == "true" && swapStatus.toString() == "Incomplete" && counterpartyDeposit.toString() == "Yet To Deposit") {
            return <td align='center'><Button variant="danger" size="sm"> {loadingId[idx] ? <Spinner size="sm" animation="border" /> : ""} Withdraw {fromSymbol}</Button></td>
        } else {
            return <td align='center'>✅</td>
        }   
    }

    return (
        <Container className={styles.MySwapsContainer}>
            <div>
                { allPages.length > 1 && renderPagination()}
            </div>
            <Table className={styles.MySwapsTable} striped bordered responsive>
                <thead>
                    <tr>
                        <th className={styles.MySwapsHeader}>Swap ID</th>
                        <th className={styles.MySwapsHeader}>You Send</th>
                        <th className={styles.MySwapsHeader}>You Recieve</th>
                        <th className={styles.MySwapsHeader}>Counterparty Address</th>
                        <th className={styles.MySwapsHeader}>Your Status</th>
                        <th className={styles.MySwapsHeader}>Counterparty Status</th>
                        <th className={styles.MySwapsHeader}>% Fee Per Party</th>
                        <th className={styles.MySwapsHeader}>Swap Status</th>
                    </tr>
                </thead>
                <tbody>
                    {tableUserSwapsPaginate.map((swap, index) => (
                        <tr key={index}>
                            <td>{swap.swapId}</td>
                            <td>{swap.send}</td>
                            <td>{swap.receive}</td>
                            <td>
                                <a className={styles.CounterPartyAddress} href={'https://etherscan.io/address/' + swap.counterParty}>{swap.counterParty}</a>
                            </td>
                            {renderYouDeposit(swap.youDeposit, swap.counterPartyStatus, swap.status, swap.fromSymbol, swap.toSymbol, tableUserSwaps.length, index)}
                            <td>{swap.counterPartyStatus}</td>
                            <td>{swap.fees}</td>
                            <td>{swap.status}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    )
}

export default MySwaps;