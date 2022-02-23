//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";


contract PartySwap {
    enum token_type {
        no_eth,
        from_eth,
        to_eth
    }

    struct Swap {
        address payable from;
        address payable to;
        address from_token;
        address to_token;
        uint from_amount;
        uint to_amount;
        uint256 fee_percent_each;
        bool from_deposited;
        bool to_deposited;
        bool from_complete;
        bool to_complete;
        uint is_eth;
    }
    Swap[] public swaps_list;

    uint256 public current_swap_id;
    uint256 public current_fee = 75; //75bps
    address payable public admin;
    mapping(address => uint) public token_fees_accrued;
    uint256 public eth_fees_accrued;

    event swapCreated(address indexed from, address indexed to, uint current_swap_id);
    event fromHasWithdrawnToTokens(address tokenAddress, uint amount);
    event toHasWithdrawnFromTokens(address tokenAddress, uint amount);

    constructor() {
        admin = payable(msg.sender);
    }

    function createSwap(address payable from, address payable to,
                                              address from_token,
                                              address to_token,
                                              uint from_amount,
                                              uint to_amount,
                                              uint is_eth,
                                              bool deposit_now) external payable {
        require(from == msg.sender, "Swap must be created from initiator address");
        swaps_list.push(Swap(from, to, from_token, to_token, from_amount,
                                                             to_amount,
                                                             current_fee,
                                                             false,
                                                             false,
                                                             false,
                                                             false,
                                                             is_eth));

        if (deposit_now) {
            require(swaps_list[current_swap_id].from == msg.sender, "Must be from Swap creator");
        
            if (swaps_list[current_swap_id].is_eth == uint256(token_type.from_eth)) {
                require(msg.value == swaps_list[current_swap_id].from_amount);
            } else {
                Token token = Token(swaps_list[current_swap_id].from_token);
                token.transferFrom(msg.sender, address(this), swaps_list[current_swap_id].from_amount);       
            }
                swaps_list[current_swap_id].from_deposited = true;     
        }

        emit swapCreated(from, to, current_swap_id);

        current_swap_id += 1;
    }

    function from_deposit(uint swap_id) public payable {
        require(swaps_list[swap_id].from == msg.sender, "Must be from Swap creator");
        require(swaps_list[swap_id].from_deposited == false, "Party already deposited");
        
        if (swaps_list[swap_id].is_eth == uint256(token_type.from_eth)) {
            require(msg.value == swaps_list[swap_id].from_amount, "Incorrect Amount");
        } else {
            Token token = Token(swaps_list[swap_id].from_token);
            token.transferFrom(msg.sender, address(this), swaps_list[swap_id].from_amount);       
        }
        swaps_list[swap_id].from_deposited = true;     
    }

    function to_deposit(uint swap_id) external payable {
        require(swaps_list[swap_id].to == msg.sender, "Must be from Swap counterparty");
        require(swaps_list[swap_id].to_deposited == false, "Party already deposited");

        if (swaps_list[swap_id].is_eth == uint256(token_type.to_eth)) {
            require(msg.value == swaps_list[swap_id].to_amount, "Incorrect Amount");
        } else {
            Token token = Token(swaps_list[swap_id].to_token);
            token.transferFrom(msg.sender, address(this), swaps_list[swap_id].to_amount);         
        }
        swaps_list[swap_id].to_deposited = true;   
    }
   
   function from_withdraw_own_tokens(uint swap_id) external {
        require(swaps_list[swap_id].from == msg.sender, "Must be from swap creator");
        require(swaps_list[swap_id].to_complete == false, "Counterparty has already withdrawn, cannot withdraw own tokens unless they redeposit");
        require(swaps_list[swap_id].from_deposited == true, "You have not deposited any tokens yet, cheek of you");

        if (swaps_list[swap_id].is_eth == uint256(token_type.from_eth)) {
            swaps_list[swap_id].from.transfer(swaps_list[swap_id].from_amount);
        } else {
            Token token = Token(swaps_list[swap_id].from_token);
            token.transfer(msg.sender, swaps_list[swap_id].from_amount);

        }
        swaps_list[swap_id].from_deposited = false;
    }

    function to_withdraw_own_tokens(uint swap_id) external {
        require(swaps_list[swap_id].to == msg.sender, "Must be from swap counterparty");
        require(swaps_list[swap_id].from_complete == false, "Counterparty has already withdrawn, cannot withdraw own tokens unless they redeposit");
        require(swaps_list[swap_id].to_deposited == true, "You have not deposited any tokens yet, cheek of you") ;
    
        if (swaps_list[swap_id].is_eth == uint256(token_type.to_eth)) {
            swaps_list[swap_id].to.transfer(swaps_list[swap_id].to_amount);
        } else {
            Token token = Token(swaps_list[swap_id].to_token);
            token.transfer(msg.sender, swaps_list[swap_id].to_amount);
        }

        swaps_list[swap_id].to_deposited = false;
    }

    function from_withdraw_to_tokens(uint swap_id) external {
        require(swaps_list[swap_id].from == msg.sender, "Withdrawals from swap participant addresses only");
        require(swaps_list[swap_id].from_complete == false, "Particpant already withdrew tokens");
        require(swaps_list[swap_id].from_deposited == true, "You must first deposit your tokens before withdrawing counterparties");
        require(swaps_list[swap_id].to_deposited == true, "Counterparty has not deposited tokens yet");

        uint to_token_fee = swaps_list[swap_id].to_amount * swaps_list[swap_id].fee_percent_each / 10000;

        if (swaps_list[swap_id].is_eth == uint256(token_type.from_eth)) {
            Token token = Token(swaps_list[swap_id].to_token);
            token_fees_accrued[swaps_list[swap_id].to_token] += to_token_fee;
            token.transfer(msg.sender, swaps_list[swap_id].to_amount - to_token_fee);
        } else {
            eth_fees_accrued += to_token_fee;
            swaps_list[swap_id].from.transfer(swaps_list[swap_id].to_amount - to_token_fee);
        }

        swaps_list[swap_id].from_complete = true;

        emit fromHasWithdrawnToTokens(swaps_list[swap_id].to_token, swaps_list[swap_id].to_amount);
    }

    function to_withdraw_from_tokens(uint swap_id) external {
        require(swaps_list[swap_id].to == msg.sender, "Withdrawals from swap participant addresses only");
        require(swaps_list[swap_id].to_complete == false, "Particpant already withdrew tokens");
        require(swaps_list[swap_id].to_deposited == true, "You must first deposit your tokens before withdrawing counterparties");
        require(swaps_list[swap_id].from_deposited == true, "Counterparty has not deposited tokens yet");

        uint from_token_fee = swaps_list[swap_id].from_amount * swaps_list[swap_id].fee_percent_each / 10000;
  
        if (swaps_list[swap_id].is_eth == uint256(token_type.to_eth)) {
            Token token = Token(swaps_list[swap_id].from_token);
            token_fees_accrued[swaps_list[swap_id].from_token] += from_token_fee;
            token.transfer(msg.sender, swaps_list[swap_id].from_amount - from_token_fee);            
        } else {
            eth_fees_accrued += from_token_fee;
            swaps_list[swap_id].to.transfer(swaps_list[swap_id].from_amount - from_token_fee); 
        }

        swaps_list[swap_id].to_complete = true;

        emit toHasWithdrawnFromTokens(swaps_list[swap_id].from_token, swaps_list[swap_id].from_amount );
    }

    function switch_admin_address(address payable new_admin) external {
        require(msg.sender == admin, "Accessible by admin only");
        admin = new_admin;
    }

    function admin_withdraw_accrued_fees(bool withdraw_eth, address token_address) external {
        require(msg.sender == admin, "Accessible by admin only");

        if (withdraw_eth) {
            admin.transfer(eth_fees_accrued);
            eth_fees_accrued = 0;
        } else {
            Token token = Token(token_address);
            token.transfer(admin, token_fees_accrued[token_address]);
            token_fees_accrued[token_address] = 0;
        }
    }

    function swaps_id_details_getter(uint swap_id) public view returns (Swap memory) {
        return swaps_list[swap_id];
    }

    function adjust_fee(uint fee) external {
        require(msg.sender == admin, "Accessible by admin only");
        require(fee <= 500);
        current_fee = fee;
    }
}