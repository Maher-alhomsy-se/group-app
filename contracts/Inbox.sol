pragma solidity ^0.4.17;

contract Inbox {
    string public message;
    address public owner;
    uint256 public priceInWei; // e.g., 0.005 ETH = 5000000000000000 wei

    address constant treasury = 0xa8ed9b14658Bb9ea3e9CC1e32BA08fcbe6888927;

    event PaymentReceived(address payer, uint256 amount);

    function Inbox(string initialMessage) public {
        message = initialMessage;
        owner = msg.sender;
        priceInWei = 9400000000000000; // $15 approx at $3,000/ETH
    }

    function setMessage(string newMessage) public {
        message = newMessage;
    }

    function getMessage() public view returns (string) {
        return message;
    }

    function pay() public payable {
        require(msg.value >= priceInWei);
        treasury.transfer(msg.value);
        PaymentReceived(msg.sender, msg.value);
    }

    function withdraw() public {
        require(msg.sender == owner);
        owner.transfer(this.balance);
    }

    function updatePrice(uint256 newPriceInWei) public {
        require(msg.sender == owner);
        priceInWei = newPriceInWei;
    }
}
