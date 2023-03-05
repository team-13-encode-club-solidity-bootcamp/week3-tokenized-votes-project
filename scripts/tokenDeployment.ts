import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Team13Token__factory } from "../typechain-types";
import { BigNumber } from "ethers";
dotenv.config();

// To run this script:
// yarn run ts-node --files scripts/tokenDeployment.ts <amountToMint>(21000000000000000000000000/21 million tokens)

async function tokenDeployment() {
  const args = process.argv;
  // console.log(args);
  const amountToMint = BigNumber.from(args[2]);
  // console.log(amountToMint);
  if (!amountToMint) throw new Error("Missing parameter : amount to mint");
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
  console.log(`Wallet balance: ${balance} Wei`);
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

  const mintTx = await team13TokenContract.mint(signer.address, amountToMint);
  const mintTxReceipt = await mintTx.wait();
  totalSupply = await team13TokenContract.totalSupply();
  console.log(
    `The mint transaction was completed in the block ${mintTxReceipt.blockNumber} \nThe total supply now is ${totalSupply} decimal units`
  );
}

tokenDeployment().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
