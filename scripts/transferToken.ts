import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Team13Token__factory } from "../typechain-types";
dotenv.config();

// To run this script:
// yarn run ts-node --files scripts/transferToken.ts <tokenContractAddress> <walletDestinationAddress> <amountToTransfer>
// yarn run ts-node --files scripts/transferToken.ts 0x56da1240DB296aAf28848A510F29482801615B0D 0xbae7c780963bBaE482e75f6132724fa9706B6Cf4 1000

async function transferToken() {
  const args = process.argv;
  // console.log(args);
  const tokenContractAddress = args[2];
  const walletDestinationAddress = args[3];
  const amountToTransfer = args[4];
  // console.log(tokenContractAddress, walletDestinationAddress, amountToTransfer);
  if (!tokenContractAddress)
    throw new Error("Missing parameter : token contract address");
  if (!walletDestinationAddress)
    throw new Error("Missing parameter : wallet destination address");
  if (!amountToTransfer)
    throw new Error("Missing parameter : amount to transfer");

  const convertedAmount = ethers.utils.parseEther(amountToTransfer);
  // console.log(convertedAmount);
  // return;

  // get default provider from hardhat config
  const provider = ethers.provider;
  // console.log(provider);

  // import wallet
  const pkey = process.env.PRIVATE_KEY; // can change with mnemonic/private key
  // Validation
  if (!pkey || pkey.length <= 0)
    throw new Error(
      "Missing environment : Private key, please check your .env file"
    );
  const wallet = new ethers.Wallet(pkey); // ethers.Wallet.fromMnemonic(mnemonic);
  console.log(`Connected to the wallet address ${wallet.address}`);

  // connect with signer and check the balance
  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(
    `Wallet balance: ${balance} Wei, ${ethers.utils.formatEther(balance)} ETH`
  );
  // return;

  const team13TokenContractFactory = new Team13Token__factory(signer);
  console.log("Attaching to contract ...");
  const team13TokenContract =
    team13TokenContractFactory.attach(tokenContractAddress);
  const contractSymbol = await team13TokenContract.symbol();
  const tokenBalanceBeforeTx = await team13TokenContract.balanceOf(
    signer.address
  );
  console.log(
    `Your ${contractSymbol} token balance before transfer is ${ethers.utils.formatEther(
      tokenBalanceBeforeTx
    )}`
  );

  console.log("Transferring Tokens ...");
  const transferTx = await team13TokenContract.transfer(
    walletDestinationAddress,
    convertedAmount
  );
  transferTx.wait().then(async (receiptTx) => {
    console.log({ receiptTx });
    console.log("Token transfer complete!");

    // Check voting power of singer
    const tokenBalanceSigner = await team13TokenContract.balanceOf(
      signer.address
    );
    const votingPowerSigner = await team13TokenContract.getVotes(
      signer.address
    );
    console.log(
      `Address: ${signer.address} - Token balance: ${ethers.utils.formatEther(
        tokenBalanceSigner
      )}, Voting Power: ${ethers.utils.formatEther(votingPowerSigner)}`
    );

    // Check voting power of wallet Destination Address
    const tokenBalanceWalletDestination = await team13TokenContract.balanceOf(
      walletDestinationAddress
    );
    const votingPowerWalletDestination = await team13TokenContract.getVotes(
      walletDestinationAddress
    );
    console.log(
      `Address: ${walletDestinationAddress} - Token balance: ${ethers.utils.formatEther(
        tokenBalanceWalletDestination
      )}, Voting Power: ${ethers.utils.formatEther(
        votingPowerWalletDestination
      )}`
    );
  });
}

transferToken().catch((e) => {
  console.log(e);
  process.exitCode = 1;
});
