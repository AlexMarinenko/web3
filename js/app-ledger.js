let transport;
let eth;
let web3;

async function connectLedger() {
  try {
    transport = await TransportWebUSB.create();
    eth = new Eth(transport);
    const path = "44'/60'/0'/0/0";
    const result = await eth.getAddress(path);
    const address = result.address;

    console.log('Ledger connected:', address);
    document.getElementById('userAddress').innerText = `Connected Address: ${address}`;
    document.getElementById('connectButton').style.display = 'none';
    document.getElementById('disconnectButton').style.display = 'inline-block';

    // Create a new instance of Web3
    web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'));

  } catch (error) {
    console.error('Error connecting to Ledger:', error);
    alert('Failed to connect to Ledger. Please try again.');
  }
}

function disconnectLedger() {
  if (transport) {
    transport.close();
  }
  transport = null;
  eth = null;
  web3 = null;
  document.getElementById('userAddress').innerText = '';
  document.getElementById('connectButton').style.display = 'inline-block';
  document.getElementById('disconnectButton').style.display = 'none';
  document.getElementById('signature').innerText = '';
  document.getElementById('verificationResult').innerText = '';
  document.getElementById('transferResult').innerText = '';
  document.getElementById('usdtBalance').innerText = '';
}

document.getElementById('connectButton').addEventListener('click', connectLedger);
document.getElementById('disconnectButton').addEventListener('click', disconnectLedger);

document.getElementById('signButton').addEventListener('click', async () => {
  if (eth && web3) {
    try {
      const message = document.getElementById('message').value;
      if (!message) {
        alert('Please enter a message to sign.');
        return;
      }

      const path = "44'/60'/0'/0/0";
      const hash = web3.utils.sha3(message);
      const signature = await eth.signPersonalMessage(path, hash.substring(2));
      const combined = `0x${signature.r}${signature.s}${signature.v.toString(16)}`;
      console.log('Signed message:', combined);
      document.getElementById('signature').innerText = `Signature: ${combined}`;
    } catch (error) {
      console.error('Error signing message:', error);
      alert('Failed to sign the message. Please try again.');
    }
  } else {
    alert('Ledger is not connected. Please connect Ledger.');
  }
});

document.getElementById('verifyButton').addEventListener('click', async () => {
  if (web3) {
    try {
      const message = document.getElementById('verifyMessage').value;
      const signature = document.getElementById('verifySignature').value;
      if (!message || !signature) {
        alert('Please enter both the message and the signature to verify.');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const address = accounts[0];

      const hash = web3.utils.sha3(message);
      const recoveredAddress = web3.eth.accounts.recover(message, signature);
      const verificationResult = recoveredAddress.toLowerCase() === address.toLowerCase() ? 'Signature is valid.' : 'Signature is invalid.';
      console.log('Verification result:', verificationResult);
      document.getElementById('verificationResult').innerText = verificationResult;
    } catch (error) {
      console.error('Error verifying signature:', error);
      alert('Failed to verify the signature. Please try again.');
    }
  } else {
    alert('Ledger is not connected. Please connect Ledger.');
  }
});

document.getElementById('transferButton').addEventListener('click', async () => {
  if (eth && web3) {
    try {
      const recipient = document.getElementById('recipient').value;
      const amount = document.getElementById('amount').value;
      if (!recipient || !amount) {
        alert('Please enter both recipient address and amount.');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const address = accounts[0];

      const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT ERC20 contract address
      const decimals = 6; // USDT has 6 decimals
      const amountInWei = web3.utils.toWei(amount, 'mwei'); // 1 USDT = 10^6 micro USDT (mwei)

      const usdtAbi = [
        // Transfer
        {
          "constant": false,
          "inputs": [
            {
              "name": "_to",
              "type": "address"
            },
            {
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "transfer",
          "outputs": [
            {
              "name": "",
              "type": "bool"
            }
          ],
          "type": "function"
        }
      ];

      const contract = new web3.eth.Contract(usdtAbi, usdtContractAddress);
      const data = contract.methods.transfer(recipient, amountInWei).encodeABI();

      const tx = {
        from: address,
        to: usdtContractAddress,
        data: data,
        value: '0x0',
        gas: 200000,
        gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei'))
      };

      const txHash = await eth.signTransaction("44'/60'/0'/0/0", tx);
      const sentTx = await web3.eth.sendSignedTransaction(txHash);
      console.log('Transfer transaction:', sentTx);
      document.getElementById('transferResult').innerText = `Transfer successful: ${sentTx.transactionHash}`;
    } catch (error) {
      console.error('Error transferring USDT:', error);
      alert('Failed to transfer USDT. Please try again.');
    }
  } else {
    alert('Ledger is not connected. Please connect Ledger.');
  }
});

document.getElementById('getBalanceButton').addEventListener('click', async () => {
  if (eth && web3) {
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const address = accounts[0];

      const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT ERC20 contract address

      const usdtAbi = [
        // BalanceOf
        {
          "constant": true,
          "inputs": [
            {
              "name": "_owner",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "name": "balance",
              "type": "uint256"
            }
          ],
          "type": "function"
        }
      ];

      const contract = new web3.eth.Contract(usdtAbi, usdtContractAddress);
      const balance = await contract.methods.balanceOf(address).call();
      const balanceInUsdt = web3.utils.fromWei(balance, 'mwei'); // 1 USDT = 10^6 micro USDT (mwei)

      console.log('USDT Balance:', balanceInUsdt);
      document.getElementById('usdtBalance').innerText = `USDT Balance: ${balanceInUsdt}`;
    } catch (error) {
      console.error('Error fetching USDT balance:', error);
      alert('Failed to fetch USDT balance. Please try again.');
    }
  } else {
    alert('Ledger is not connected. Please connect Ledger.');
  }
});
