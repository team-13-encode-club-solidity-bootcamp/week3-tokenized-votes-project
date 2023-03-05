import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Team13Token__factory } from "../typechain-types";
dotenv.config();

// To run this script:
// yarn run ts-node --files scripts/tokenDeployment.ts <amountToMint>
// yarn run ts-node --files scripts/tokenDeployment.ts 21000000

async function tokenDeployment() {
  const args = process.argv;
  // console.log(args);
  const amountToMint = args[2];
  // console.log(amountToMint);
  if (!amountToMint) throw new Error("Missing parameter : amount to mint");
  // return;
  const convertedAmount = ethers.utils.parseEther(amountToMint);

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

  console.log("Deploying token contract");

  const team13TokenContractFactory = new Team13Token__factory(signer);
  const team13TokenContract = await team13TokenContractFactory.deploy();
  const deployTxReceipt = await team13TokenContract.deployTransaction.wait();
  console.log(
    `The token contract was deployed at the address ${team13TokenContract.address} at block ${deployTxReceipt.blockNumber}`
  );
  const contractName = await team13TokenContract.name();
  const contractSymbol = await team13TokenContract.symbol();
  const contractDecimals = await team13TokenContract.decimals();
  let totalSupply = await team13TokenContract.totalSupply();
  console.log(
    `The contract name is ${contractName} \nThe contract symbol is ${contractSymbol} \nThe total supply is ${totalSupply} decimal units \nThe decimals units is ${contractDecimals}`
  );
  // return;

  console.log("Minting token");
  const mintTx = await team13TokenContract.mint(
    signer.address,
    convertedAmount
  );
  const mintTxReceipt = await mintTx.wait();
  totalSupply = await team13TokenContract.totalSupply();
  console.log(
    `The mint transaction was completed in the block ${mintTxReceipt.blockNumber} \nThe total supply now is ${totalSupply} decimal units`
  );

  console.log("Self delegated as deployer");
  const delegateTx = await team13TokenContract
    .connect(signer)
    .delegate(signer.address);
  const delegateTxReceipt = await delegateTx.wait();
  console.log(`Tokens delegated at block ${delegateTxReceipt.blockNumber}`);

  const votePowerDeployer = await team13TokenContract.getVotes(signer.address);
  console.log(
    `As deployer you have ${ethers.utils.formatEther(
      votePowerDeployer
    )} voting power`
  );
}

tokenDeployment().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
