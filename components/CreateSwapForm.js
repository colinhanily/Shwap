import React, { useEffect, useState } from 'react';
import styles from '../styles/Form.module.css'
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import tokens from '../public/tokens.json';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import { Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { InputGroup } from 'react-bootstrap';
import { connectWalletHandler, isToken, isValidAddress, createSwap, approveToken, checkTokenIsApproved, getTotalSwaps} from '../components/utils';

const web3 = require('web3');

const CreateSwapForm = () => {   
    const [validFromToken, setValidFromToken] = useState(false);
    const [validToToken, setValidToToken] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(' ');
    const [approveButtonLoading, setApproveButtonLoading] = useState(false);
    const [createButtonLoading, setCreateButtonLoading] = useState(false);
    const [fromToken, setFromToken] = useState('');
    const [toToken, setToToken] = useState('');
    const [fromTokenAddress, setFromTokenAddress] = useState(' ');
    const [toTokenAddress, setToTokenAddress] = useState(' ');
    const [fromAmount, setFromAmount] = useState(' ');
    const [toAmount, setToAmount] = useState(' ');
    const [counterPartyAddress, setCounterPartyAddress] = useState(' ');
    const [sendOnCreate, setSendOnCreate] = useState(false);
    const [canCreateSwap, setCreateSwap] = useState(true);
    const [canClickApprove, setApproveButton] = useState(true);
    const [tokenApproved, isApproved] = useState(false);
    const [fromTokenImage, setFromTokenImage] = useState(false);
    const [toTokenImage, setToTokenImage] = useState(false);
    const [fromTokenCorrect, isFromTokenCorrect] = useState(false);
    const [toTokenCorrect, isToTokenCorrect] = useState(false);
    const [totalSwaps, setTotalSwaps] = useState(undefined);

    const enableCreateSwap = async (_fromTokenAddress, _toTokenAddress, _validFromToken, _validToToken, _fromAmount,
                                    _toAmount, _counterPartyAddress, _tokenApproved) => {
        if (_validFromToken == false    ||
            _validToToken == false      ||
            _fromAmount == ' '          ||
            _fromAmount == 0            ||
            _toAmount == ' '            ||
            _toAmount == 0              ||
            _counterPartyAddress == ' ' ||
            _tokenApproved == false     ||
            _fromTokenAddress == _toTokenAddress) {
            //console.log(_validFromToken)
            //console.log(_validToToken)
            //console.log(_fromTokenAddress)
            //console.log(_toTokenAddress)
            //console.log(_fromAmount)
            //console.log(_toAmount)
            //console.log(_counterPartyAddress)
            //console.log(_tokenApproved)
            setCreateSwap(true)
        } else {
            setCreateSwap(false);
        }
    }
        
    const checkFromToken = async (tokenAddress) => {
        tokenAddress = tokenAddress.trim();
        let approved = tokenApproved;

        setFromTokenImage(false)
        setFromToken(tokenAddress);
        setFromTokenAddress('');

        if (tokenAddress == toTokenAddress) {
            setFromTokenAddress(' ')
            isFromTokenCorrect(false)
        } 

        if (isValidAddress(tokenAddress) === true) {
            if (await isToken(tokenAddress) === true) {
                setFromTokenAddress(tokenAddress);
                setValidFromToken(true);
                if (tokenAddress == toTokenAddress) {
                    isFromTokenCorrect("danger")
                } else {
                    isFromTokenCorrect("success")
                }
                approved = await (checkTokenIsApproved(currentAccount, tokenAddress));
                if (approved === true ) {
                    setApproveButton(true);
                    isApproved(true);
                } else {
                    setApproveButton(false)
                }
            } else {
                setValidFromToken(false);
                setApproveButton(false);
                isFromTokenCorrect("danger")
                setApproveButton(true);
                isApproved(false);
            }
        } else {
            if (validToToken) {
                isToTokenCorrect("success")
            }
            
            if (tokenAddress == "") {
                isFromTokenCorrect(false)
            } else {
                isFromTokenCorrect("danger")
            }
            isApproved(false);
            setApproveButton(true);
        }
        enableCreateSwap(tokenAddress, toTokenAddress, true, validToToken, fromAmount, toAmount, counterPartyAddress, approved)
    }

    const checkToToken = async (tokenAddress) => {
        tokenAddress = tokenAddress.trim();
    
        setToTokenImage(false)
        setToToken(tokenAddress);
        setToTokenAddress('');

        if (tokenAddress == fromTokenAddress) {
            setToTokenAddress(' ')
            isToTokenCorrect(false)
        } 

        if (isValidAddress(tokenAddress) === true) {
            if (await isToken(tokenAddress) === true) {
                setToTokenAddress(tokenAddress);
                setValidToToken(true);
                if (tokenAddress == fromTokenAddress) {
                    isToTokenCorrect("danger")
                } else {
                    isToTokenCorrect("success")
                }                
            } else {
                setValidToToken(false);
                isToTokenCorrect("danger")
            }
        } else {
            if (validFromToken)
                isFromTokenCorrect("success")
            if (tokenAddress == "")
                isToTokenCorrect(false)
            else
                isToTokenCorrect("danger")
        }

        enableCreateSwap(fromTokenAddress, tokenAddress, validFromToken, true, fromAmount, toAmount, counterPartyAddress, tokenApproved)
    }

    const checkCounterPartyAddress = async (address) => {
        address = address.trim();
        if (isValidAddress(address) == true) {
            if (counterPartyAddress == currentAccount)
                setCounterPartyAddress(false) 
            else {
                setCounterPartyAddress(address);
                enableCreateSwap(fromTokenAddress, toTokenAddress, validFromToken, validToToken, fromAmount, toAmount, address, tokenApproved)
            }
        } else {
            setCounterPartyAddress(false);
            setCreateSwap(true);
        }
    }

    const checkFromAmount = async (amount) => {
        if (isNaN(amount) || amount === ' ') {
            setFromAmount(' ');
            amount = ' ';
        } else {
            setFromAmount(amount);
        }

        enableCreateSwap(fromTokenAddress, toTokenAddress, validFromToken, validToToken, amount, toAmount, counterPartyAddress, tokenApproved)
    }

    const checkToAmount = (amount) => {
        if (isNaN(amount) || amount == 0 || isNaN(parseInt(amount, 10))) {
            setToAmount(' ');
            amount = ' ';
        } else {
            setToAmount(amount);
        }

        enableCreateSwap(fromTokenAddress, toTokenAddress, validFromToken, validToToken, fromAmount, amount, counterPartyAddress, tokenApproved)
    }

    const approval = async () => {

        setApproveButtonLoading(true)
        const approval = await approveToken(currentAccount, fromTokenAddress);
         
        if (approval == true) {
            setApproveButton(true);
            setApproveButtonLoading(false)   
            isApproved(true)
        } else {
            isApproved(false)
        }

        enableCreateSwap(fromTokenAddress, toTokenAddress, validFromToken, validToToken, fromAmount, toAmount, counterPartyAddress, true);
    }

    const create = async () => {
        var isEth = 0;

        if (fromTokenAddress == '0x0000000000000000000000000000000000000000')
            isEth = 1;
        else if (toTokenAddress == '0x0000000000000000000000000000000000000000')
            isEth = 2
        
        setCreateButtonLoading(true)
        let created = await createSwap(currentAccount, counterPartyAddress, fromTokenAddress, toTokenAddress, fromAmount, toAmount, isEth, sendOnCreate);
        if (created == true) {
            window.location.reload(true);
        } else if (created == false) {
            setCreateButtonLoading(false)
        }
    }

    async function grabFromDropDownToken(token, tokenImage, tokenAddress) {
        if (tokenAddress == toTokenAddress) {
            setFromTokenAddress(' ');
            isFromTokenCorrect("danger");
        } else {
            setFromTokenAddress(tokenAddress);
            isFromTokenCorrect("success")
        }
        setFromToken(token);
        setFromTokenImage(tokenImage);
        setValidFromToken(true);

        const approved = await checkTokenIsApproved(currentAccount, tokenAddress)
        if (approved === true || tokenAddress == "0x0000000000000000000000000000000000000000" ) {
            isApproved(true);
            setApproveButton(true);
            approved = true;
        } else {
            isApproved(false);
            setApproveButton(false);
            approved = false;
        }

        enableCreateSwap(fromTokenAddress, toTokenAddress, true, validToToken, fromAmount, toAmount, counterPartyAddress, approved)
    }

    function grabToDropDownToken(token, tokenImage, tokenAddress) {
        if (tokenAddress == fromTokenAddress) {
            setToTokenAddress(' ')
            isToTokenCorrect("danger")
        } else {
            setToTokenAddress(tokenAddress);
            isToTokenCorrect("success")
        }
        
        setToToken(token);
        setToTokenImage(tokenImage);
        setValidToToken(true);

        enableCreateSwap(fromTokenAddress, tokenAddress, validFromToken, true, fromAmount, toAmount, counterPartyAddress, tokenApproved)
    }

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
const CustomMenu = React.forwardRef(
    ({ children, style, className}, ref) => {
      const [value, setValue] = useState('');
  
      return (
        <div
          ref={ref}
          style={style}
          className={className}
        >
          <FormControl
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Filter..."
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
          <ul className="list-unstyled">
            {React.Children.toArray(children).filter(
              (child) =>
                !value || child.props.children.toString().toLowerCase().includes(value.toLowerCase()) || child.props.children.toString().toLowerCase().includes(value.toUpperCase()),
            )}
          </ul>
        </div>
      );
    },
  );
      
    useEffect(() => {
        async function setAccount() {
           let account = await connectWalletHandler();
           setCurrentAccount(account);
           let numSwaps = await getTotalSwaps();
           setTotalSwaps(numSwaps)
        };
        setAccount();
    }, []);
    

    return (
        <Container className={styles.FormContainer}>
            { totalSwaps != 0 && <h1 className={styles.CounterLabel}>Total Number of Swaps</h1> }
            { totalSwaps != 0 && <h2 className={styles.CounterValue}>{totalSwaps}</h2> }
            <Form>
                <Form.Group className="mb-4">
                    <Form.Label className={styles.FormLabel} >You Send</Form.Label>
                    <Row>
                        <Col>
                            <InputGroup className={styles.FormInputSplitLeft}>
                                <Form.Control placeholder="Token Address..." value={fromToken}  onChange={e => checkFromToken(e.target.value)} />
                                <Dropdown>
                                    <Dropdown.Toggle id="dropdownFromToken"className={fromTokenCorrect === false ? styles.DropdownButton : (fromTokenCorrect === "success" ? styles.DropdownButtonSuccess : styles.DropdownButtonDanger)}>
                                    { fromTokenImage != false &&   <img width="30" height="30" className={styles.TokenImage} src={fromTokenImage}></img> }
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className={styles.DropDownMenu} as={CustomMenu}>
                                        {tokens.map((tokens, key) => (
                                        <Dropdown.Item key={key} onClick={(e) => grabFromDropDownToken(tokens.symbol, tokens.logoURI, tokens.address)} eventKey={tokens.symbol}><img width="30" height="30" className={styles.TokenImage} src={tokens.logoURI}></img>{tokens.symbol}</Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                        
                                </Dropdown>
                            </InputGroup>
                        </Col>
                        <Col>
                            <InputGroup className={styles.FormInputSplitRight} onChange={e => checkFromAmount(e.target.value)}>
                                <Form.Control placeholder="0.0"/>
                            </InputGroup>
                        </Col>
                    </Row>
                </Form.Group>
                <Form.Group className={styles.ToForm}>
                <Form.Label className={styles.FormLabel}>You Receive</Form.Label>
                    <Row>
                        <Col>
                            <InputGroup className={styles.FormInputSplitLeft}>
                                <Form.Control value={toToken} placeholder="Token Address..." onChange={e => checkToToken(e.target.value)} />
                                <Dropdown>
                                    <Dropdown.Toggle id="dropdownToToken" className={toTokenCorrect === false ? styles.DropdownButton : (toTokenCorrect === "success" ? styles.DropdownButtonSuccess : styles.DropdownButtonDanger)}>
                                    { toTokenImage != false &&  <img width="30" height="30" className={styles.TokenImage} src={toTokenImage}></img> }
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className={styles.DropDownMenu} as={CustomMenu}>
                                        {tokens.map((tokens, key) => (
                                        <Dropdown.Item key={key} onClick={(e) => grabToDropDownToken(tokens.symbol, tokens.logoURI, tokens.address)} eventKey={tokens.symbol}><img width="30" height="30" className={styles.TokenImage} src={tokens.logoURI}></img>{tokens.symbol}</Dropdown.Item>
                                    
                                        ))}
                                    </Dropdown.Menu>
                                        
                                </Dropdown>
                            </InputGroup>
                        </Col>
                        
                        
                        <Col>
                            <InputGroup className={styles.FormInputSplitRight}>
                                <Form.Control placeholder="0.0" onChange={e => checkToAmount(e.target.value)} />
                            </InputGroup>
                        </Col>
                    </Row>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className={styles.FormLabel}>Counterparty Address</Form.Label>
                    <Col>
                        <Form.Control className={ counterPartyAddress === false ? styles.CounterPartyAddressIncorrect : styles.CounterPartyAddress} placeholder="0x..." onChange={e => checkCounterPartyAddress(e.target.value) }/>
                    </Col>
                </Form.Group>
                <Form.Group>
                    <Form.Label className={styles.CheckBoxLabel}>Deposit Your Side of the Trade on Swap Creation (Saves Gas!)</Form.Label>
                    <Col>
                        <Form.Check className={styles.FormCheckbox} onChange={(e) => setSendOnCreate(e.target.checked)}/>
                    </Col>
                </Form.Group>
            </Form>
            <Row>
                <Col>
                    <div className="text-center">
                        <Button  disabled={canClickApprove} onClick={() => approval()} className={styles.Approve}>
                            { approveButtonLoading && <Spinner size="sm" animation="border" />} Approve
                        </Button>

                    </div>
                </Col>
                <Col>
                    <div className="text-center">
                        <Button disabled={canCreateSwap} className={styles.CreateSwap} onClick={() => create()}>{ createButtonLoading && <Spinner size="sm" animation="border" />} Create Swap</Button >           
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export default CreateSwapForm;