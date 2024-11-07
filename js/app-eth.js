window.addEventListener('load', async () => {
  if (window.ethereum) {
    // Check if MetaMask is already connected
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      const address = accounts[0];
      document.getElementById('userAddress').innerText = `Connected Address: ${address}`;
      document.getElementById('connectButton').style.display = 'none';
      window.web3 = new Web3(window.ethereum);
      document.getElementById('getBalanceButton').click();
    }
  } else {
    alert('MetaMask is not installed. Please install MetaMask extension.');
  }
});

document.getElementById('connectButton').addEventListener('click', async () => {
  if (window.ethereum) {
    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const address = accounts[0];
      console.log('User address:', address);
      document.getElementById('userAddress').innerText = `Connected Address: ${address}`;
      document.getElementById('connectButton').style.display = 'none';
      document.getElementById('disconnectButton').style.display = 'inline-block';
      window.web3 = new Web3(window.ethereum);
      document.getElementById('getBalanceButton').click();
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
    }
  } else {
    alert('MetaMask is not installed. Please install MetaMask extension.');
  }
});

document.getElementById('signButton').addEventListener('click', async () => {
  if (window.web3) {
    try {
      const message = document.getElementById('message').value;
      if (!message) {
        alert('Please enter a message to sign.');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const address = accounts[0];

      const msg = `0x${buffer.Buffer.from(message, "utf8").toString("hex")}`

      // const signature = await window.web3.eth.personal.sign(message, address);
      const signature = await ethereum.request({ method: 'personal_sign', params: [msg, address] });
      console.log('Signed message:', signature);
      document.getElementById('signature').innerText = `Signature: ${signature}`;
    } catch (error) {
      console.error('Error signing message:', error);
      alert('Failed to sign the message. Please try again.');
    }
  } else {
    alert('MetaMask is not connected. Please connect MetaMask.');
  }
});

document.getElementById('verifyButton').addEventListener('click', async () => {
  if (window.web3) {
    try {
      const message = document.getElementById('verifyMessage').value;
      const signature = document.getElementById('verifySignature').value;
      if (!message || !signature) {
        alert('Please enter both the message and the signature to verify.');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const address = accounts[0];

      const recoveredAddress = await web3.eth.personal.ecRecover(message, signature);
      const verificationResult = recoveredAddress.toLowerCase() === address.toLowerCase() ? 'Signature is valid.' : 'Signature is invalid.';
      console.log('Verification result:', verificationResult);
      document.getElementById('verificationResult').innerText = verificationResult;
    } catch (error) {
      console.error('Error verifying signature:', error);
      alert('Failed to verify the signature. Please try again.');
    }
  } else {
    alert('MetaMask is not connected. Please connect MetaMask.');
  }
});

document.getElementById('transferButton').addEventListener('click', async () => {
  if (window.web3) {
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
      const transaction = await contract.methods.transfer(recipient, amountInWei).send({ from: address });
      console.log('Transfer transaction:', transaction);
      document.getElementById('transferResult').innerText = `Transfer successful: ${transaction.transactionHash}`;
    } catch (error) {
      console.error('Error transferring USDT:', error);
      alert('Failed to transfer USDT. Please try again.');
    }
  } else {
    alert('MetaMask is not connected. Please connect MetaMask.');
  }
});

document.getElementById('getBalanceButton').addEventListener('click', async () => {
  if (window.web3) {
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
    alert('MetaMask is not connected. Please connect MetaMask.');
  }
});
