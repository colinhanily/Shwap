import React, { useEffect, useState } from 'react';
import styles from '../styles/MySwaps.module.css'
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Pagination, Spinner } from 'react-bootstrap';
import { connectWalletHandler, getUserSwaps, formatUserSwaps, deposit, withdrawCounterPartyTokens, withdrawOwnTokens} from '../components/utils';


const MySwaps = () => {
    const [tableUserSwaps, setTableUserSwaps] = useState([]);
    const [tableUserSwapsPaginate, setTableUserSwapsPaginate] = useState([]);
    const [allPages, setAllPagesList] = useState([]);
    const [currentPagesList, setCurrentPagesList] = useState();
    const [activePage, setActivePage] = useState(1);
    const [currentAccount, setCurrentAccount] = useState(' ');
    const [loadingId, setLoadingId] = useState([]);
    const [withdrawOwnloading, setWithdrawOwnLoading] = useState(false);
    const [withdrawCounterPartyLoading, setWithdrawCounterPartyLoading] = useState(false);


    const mockFetch = () =>
        new Promise((resolve) => {
        setTimeout(() => resolve(), 3000);
    });

    const userDeposit = async (e) => {
        const { id } = e.target;
        setLoadingId((ids) => ({
            ...ids,
            [id]: true
        }));
        try {
            await mockFetch()
            await deposit(currentAccount, tableUserSwapsPaginate[id]);
        } catch (error){
            //ignore
        } finally {
            setLoadingId((ids) => ({
                ...ids,
                [id]: false
            }));
            refreshTable()
        }
    };

    const userWithdrawOwn = async (e) => {
        const { id } = e.target;
        setWithdrawOwnLoading(true)
        setLoadingId((ids) => ({
            ...ids,
            [id]: true
        }));
        try {
            await mockFetch()
            await withdrawOwnTokens(currentAccount, tableUserSwapsPaginate[id]);
        } catch (error){
            //error
        } finally {
            setLoadingId((ids) => ({
                ...ids,
                [id]: false
            }));
            setWithdrawOwnLoading(false)
            refreshTable()
        }
    };

    const userWithdrawCounterparty = async (e) => {
        const { id } = e.target;
        setWithdrawCounterPartyLoading(true)
        setLoadingId((ids) => ({
            ...ids,
            [id]: true
        }));
        try {
            await mockFetch()
            await withdrawCounterPartyTokens(currentAccount, tableUserSwapsPaginate[id]);
        } catch (error){
            //error
        } finally {
            setLoadingId((ids) => ({
                ...ids,
                [id]: false
            }));
            setWithdrawCounterPartyLoading(false)
            refreshTable()
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
        async function setAccount() {
            let account = await connectWalletHandler();
            setCurrentAccount(account);
         };
        setAccount();
        getSwaps();
        
    }, []);

    const refreshTable = async (e) => {
        let swaps = await getUserSwaps(currentAccount);
        let formattedSwaps = await formatUserSwaps(currentAccount, swaps);
        setTableUserSwaps(formattedSwaps);
        let items = getInitialPages(formattedSwaps);
        setCurrentPagesList(items.slice(0,5))
        let pageData = formatInitialTableData(formattedSwaps, activePage);
        setTableUserSwapsPaginate(pageData)
        
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
        setTableUserSwapsPaginate(swaps);

        return swaps;
    }

    const renderTableValues = () => {
        return (
            tableUserSwapsPaginate.map((swap, index) => (
                <tr key={index}>
                    <td align='center' className={styles.TableValuesNotButtons}>{swap.swapId}</td>
                    <td align='center' className={styles.TableValuesNotButtons}>{swap.send}</td>
                    <td align='center' className={styles.TableValuesNotButtons}>{swap.receive}</td>
                    <td align='center' className={styles.TableValuesNotButtons}>
                        <a className={styles.CounterPartyAddress} href={'https://etherscan.io/address/' + swap.counterParty}>{swap.counterParty}</a>
                    </td>
                    {renderYouDeposit(swap.youDeposit, swap.counterPartyDeposit, swap.fromComplete, swap.toComplete, swap.fromSymbol, swap.toSymbol, index, swap.swapId)}
                    <td align='center' className={styles.TableValuesNotButtons}>{swap.counterPartyStatus}</td>
                    <td align='center' className={styles.TableValuesNotButtons}>{swap.fees}</td>
                    <td align='center' className={styles.TableValuesNotButtons}>{swap.status}</td>
                </tr>
            ))
        )
    }

    function renderYouDeposit(youDeposit, counterpartyDeposit, youComplete, counterpartyComplete, fromSymbol, toSymbol, idx, swapId) {
        if(youDeposit.toString() == "false") {
            return <td align='center'>
                    <Button className={styles.TableButtons} id={idx} onClick={userDeposit} size="sm">
                        {loadingId[idx] ? <Spinner size="sm" animation="border" /> : ""} Deposit {fromSymbol}
                    </Button></td>
        }

        if (youDeposit.toString() == "true" && youComplete.toString() == "false" && counterpartyDeposit.toString() == "true" && counterpartyComplete.toString() == "false" ) {
            return <td align='center'>
                    <Button className={styles.TableButtons} id={idx} onClick={userWithdrawCounterparty} variant="success" size="sm">
                        {loadingId[idx] && withdrawCounterPartyLoading ? <Spinner size="sm" animation="border" /> : ""} Withdraw {toSymbol}
                    </Button>
                    <Button className={styles.TableButtons} id={idx} onClick={userWithdrawOwn} variant="danger" size="sm">
                        {loadingId[idx] && withdrawOwnloading ? <Spinner size="sm" animation="border" /> : ""} Withdraw {fromSymbol}
                    </Button>
                    </td>
        } else if (youDeposit.toString() == "true" && youComplete.toString() == "false" && counterpartyDeposit.toString() == "true" && counterpartyComplete.toString() == "true") {
            return  <td align='center'>
                        <Button className={styles.TableButtons} id={idx} onClick={userWithdrawCounterparty} variant="success" size="sm">
                            {loadingId[idx] ? <Spinner size="sm" animation="border" /> : ""} Withdraw {fromSymbol}
                        </Button></td>
        } else if (youDeposit.toString() == "true" && youComplete.toString() == "false" && counterpartyDeposit.toString() == "false" && counterpartyComplete.toString() == "false") {
            return <td align='center'>
                    <Button className={styles.TableButtons} id={idx} onClick={userWithdrawOwn} variant="danger" size="sm">
                        {loadingId[idx] ? <Spinner size="sm" animation="border" /> : ""} Withdraw {fromSymbol}
                    </Button></td>
        } else {
            return <td align='center' className={styles.TableValuesNotButtons}>✅</td>
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
                    {renderTableValues()}
                </tbody>
            </Table>
        </Container>
    )
}

export default MySwaps;