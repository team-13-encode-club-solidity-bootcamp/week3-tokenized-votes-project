import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Team13Token__factory } from "../typechain-types";
dotenv.config();

// To run this script:
// yarn run ts-node --files scripts/delegateVotingPower.ts <tokenContractAddress> <walletAddressToDelegateTheVotingPower>
// yarn run ts-node --files scripts/delegateVotingPower.ts 0x56da1240db296aaf28848a510f29482801615b0d 0xec1f21C15d6F70fbF50974438Facf148b227B6B3

async function delegateVotingPower() {
  const args = process.argv;
  // console.log(args);
  const contractAddress = args[2];
  const walletAddressToDelegateTheVotingPower = args[3];
  // console.log(contractAddress, walletAddressToDelegateTheVotingPower);
  if (!contractAddress) throw new Error("Missing parameter : amount to mint");
  if (!walletAddressToDelegateTheVotingPower)
    throw new Error(
      "Missing parameter : wallet Address To Delegate The Voting Power"
    );
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
  const team13TokenContract =
    team13TokenContractFactory.attach(contractAddress);

  const contractSymbol = await team13TokenContract.symbol();
  const tokenBalance = await team13TokenContract.balanceOf(signer.address);
  console.log(
    `Your ${contractSymbol} token balance is ${ethers.utils.formatEther(
      tokenBalance
    )}`
  );

  console.log("Delegated your voting power");
  const delegateTx = await team13TokenContract
    .connect(signer)
    .delegate(signer.address);
  const delegateTxReceipt = await delegateTx.wait();
  console.log(`Tokens delegated at block ${delegateTxReceipt.blockNumber}`);

  const votePowerDeployer = await team13TokenContract.getVotes(signer.address);
  console.log(
    `The ${walletAddressToDelegateTheVotingPower} have ${ethers.utils.formatEther(
      votePowerDeployer
    )} voting power`
  );
}

delegateVotingPower().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
