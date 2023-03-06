import { ethers } from "hardhat";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

// yarn run ts-node --files scripts/queryResult.ts <BALLOT_ADDRESS>
// yarn run ts-node --files scripts/queryResult.ts 0xbE12cE790C46f88Ed31eBF79cA02E6D917Fa61d9

async function proposalResult() {
  const args = process.argv;

  // Store the params from terminal into variable
  const ballotAddress = args[2];

  // Validation
  if (!ballotAddress) throw new Error("Missing parameter: ballot address");

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

  // pick develop ballot factory, check the winner proposal and console.log output
  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContract = ballotContractFactory.attach(ballotAddress);
  const winnerProposal = await ballotContract.winningProposal();
  const nameWinnerProposal = await ballotContract.winnerName();
  console.log(
    `The winner proposal is ${winnerProposal} and the name is: ${ethers.utils.parseBytes32String(
      nameWinnerProposal
    )}`
  );
}

proposalResult().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
