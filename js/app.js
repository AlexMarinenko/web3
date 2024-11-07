document.getElementById('connectButton').addEventListener('click', async () => {
  if (window.tronWeb && window.tronWeb.ready) {
    // TronLink is installed and ready
    try {
      const address = window.tronWeb.defaultAddress.base58;
      console.log('User address:', address);
      document.getElementById('userAddress').innerText = `Connected Address: ${address}`;
      document.getElementById('getBalanceButton').click();
    } catch (error) {
      console.error('Error fetching address:', error);
      alert('Failed to fetch the user address. Please try again.');
    }
  } else {
    // TronLink is not installed
    alert('TronLink is not installed. Please install TronLink extension.');
  }
});

document.getElementById('signButton').addEventListener('click', async () => {
  if (window.tronWeb && window.tronWeb.ready) {
    try {
      const message = document.getElementById('message').value;
      if (!message) {
        alert('Please enter a message to sign.');
        return;
      }

      const signedMessage = await window.tronWeb.trx.signMessageV2(message);

      console.log('Signed message:', signedMessage);
      document.getElementById('signature').innerText = `Signature: ${signedMessage}`;
    } catch (error) {
      console.error('Error signing message:', error);
      alert('Failed to sign the message. Please try again.');
    }
  } else {
    alert('TronLink is not installed or connected. Please connect TronLink.');
  }
});

document.getElementById('verifyButton').addEventListener('click', async () => {
  if (window.tronWeb && window.tronWeb.ready) {
    try {
      const message = document.getElementById('verifyMessage').value;
      const signature = document.getElementById('verifySignature').value;
      if (!message || !signature) {
        alert('Please enter both the message and the signature to verify.');
        return;
      }

      const recoveredAddress = await window.tronWeb.trx.verifyMessageV2(message, signature);
      const userAddress = window.tronWeb.defaultAddress.base58;
      console.log('recoveredAddress result:', recoveredAddress);
      console.log('userAddress result:', userAddress);

      const verificationResult = recoveredAddress === userAddress ? 'Signature is valid.' : 'Signature is invalid.';
      console.log('Verification result:', verificationResult);
      document.getElementById('verificationResult').innerText = verificationResult;
    } catch (error) {
      console.error('Error verifying signature:', error);
      alert('Failed to verify the signature. Please try again.');
    }
  } else {
    alert('TronLink is not installed or connected. Please connect TronLink.');
  }
});

document.getElementById('transferButton').addEventListener('click', async () => {
  if (window.tronWeb && window.tronWeb.ready) {
    try {
      const recipient = document.getElementById('recipient').value;
      const amount = document.getElementById('amount').value;
      if (!recipient || !amount) {
        alert('Please enter both recipient address and amount.');
        return;
      }

      const tronWeb = window.tronWeb;
      const USDT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT TRC20 contract address

      const functionSelector = 'transfer(address,uint256)';
      const parameter = [{type:'address',value:recipient},{type:'uint256',value: amount}]
      const tx = await tronWeb.transactionBuilder.triggerSmartContract(USDT_ADDRESS, functionSelector, {}, parameter);
      const signedTx = await tronWeb.trx.sign(tx.transaction);
      const result = await tronWeb.trx.sendRawTransaction(signedTx);


      console.log('Transfer result:', result);
      document.getElementById('transferResult').innerText = `Transfer successful: ${result}`;
    } catch (error) {
      console.error('Error transferring USDT:', error);
      alert('Failed to transfer USDT. Please try again.');
      //TDT1TxyKtHMqVfLhPLokqhPrBqFZBUR72N
    }
  } else {
    alert('TronLink is not installed or connected. Please connect TronLink.');
  }
});

document.getElementById('getBalanceButton').addEventListener('click', async () => {
  if (window.tronWeb && window.tronWeb.ready) {
    try {
      const address = window.tronWeb.defaultAddress.base58;
      const USDT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT TRC20 contract address
      //
      const contract = await window.tronWeb.contract().at(USDT_ADDRESS);
      const balance = await contract.balanceOf(address).call();
      const decimals = 6; // USDT has 6 decimals
      const balanceInUsdt = balance / Math.pow(10, decimals);

      // window.tronWeb.trx.getBalance(address).then(result => {
      //   console.log(result);
      //   document.getElementById('usdtBalance').innerText = `USDT Balance: ${balanceInUsdt}`;
      // });
      console.log('USDT Balance:', balanceInUsdt);
      document.getElementById('usdtBalance').innerText = `USDT Balance: ${balanceInUsdt}`;

    } catch (error) {
      console.error('Error fetching USDT balance:', error);
      alert('Failed to fetch USDT balance. Please try again.');
    }
  } else {
    alert('TronLink is not installed or connected. Please connect TronLink.');
  }
});
