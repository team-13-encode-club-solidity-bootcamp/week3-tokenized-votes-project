import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
dotenv.config();

// To run this script:
// yarn run ts-node --files scripts/voting.ts <BALLOT_ADDRESS> <SELECTED_PROPOSAL_INDEX 0/1/2> <amountVotingPower>
// yarn run ts-node --files scripts/voting.ts 0xbE12cE790C46f88Ed31eBF79cA02E6D917Fa61d9 0 1000

async function voting() {
  const args = process.argv;

  // Store the params from terminal into variable
  const ballotAddress = args[2];
  const selectedProposal = args[3];
  const amountVotingPower = args[4];

  // Validation
  if (!ballotAddress) throw new Error("Missing parameter: ballot address");
  if (!selectedProposal)
    throw new Error("Missing parameter: selected proposal");
  if (!amountVotingPower)
    throw new Error("Missing parameter: amount token to votes");

  // console.log(ballotAddress, selectedProposal, amountVotingPower);
  const convertedProposal = +selectedProposal;
  const convertedAmount = ethers.utils.parseEther(amountVotingPower);
  // console.log(convertedProposal, convertedAmount);

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

  // pick develop ballot factory, attach a voter to vote his choice and console.log output
  const ballotContractFactory = new Ballot__factory(signer);
  console.log("Attaching to contract ...");
  const ballotContract = ballotContractFactory.attach(ballotAddress);
  console.log(`You voted for this proposal: ${selectedProposal}`);
  const voted = await ballotContract.vote(convertedProposal, convertedAmount);
  const votedTxReceipt = await voted.wait();
  console.log({ votedTxReceipt });
}

voting().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
