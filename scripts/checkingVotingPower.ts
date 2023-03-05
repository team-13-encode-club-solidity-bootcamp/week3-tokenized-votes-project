import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
dotenv.config();

// To run this script:
// yarn run ts-node --files scripts/checkingVotingPower.ts <BALLOT_ADDRESS> <walletAddressToCheck>
// yarn run ts-node --files scripts/checkingVotingPower.ts 0xbE12cE790C46f88Ed31eBF79cA02E6D917Fa61d9 0x640B3492b9dCd25a4a5dAc91C9ac2169a76138CA 0x88a0B02d1b7fe2cBA1cE5A668e2350c50374d092 0xec1f21C15d6F70fbF50974438Facf148b227B6B3 0xbae7c780963bBaE482e75f6132724fa9706B6Cf4

async function checkingVotingPower() {
  let addresses: string[] = [];
  const args = process.argv;

  // Store the params from terminal into variable
  const ballotAddress = args[2];
  const walletAddressToCheck = args.slice(3);

  // Validation
  if (!ballotAddress) throw new Error("Missing parameter: ballot address");
  if (walletAddressToCheck.length <= 0) throw new Error("Missing address");
  // getAddress will throw error if address is invalid
  walletAddressToCheck.forEach((arg, index) => {
    console.log(`Address ${index + 1}: ${arg}`);
    addresses.push(ethers.utils.getAddress(arg));
  });

  // console.log(ballotAddress);

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

  const ballotContractFactory = new Ballot__factory(signer);
  console.log("Attaching to contract ...");
  const ballotContract = ballotContractFactory.attach(ballotAddress);
  // Check target block number
  const targetBlockNumber = await ballotContract.targetBlockNumber();
  console.log(`Target Block Number: ${targetBlockNumber}`);

  // Check token balance and voting power for each address arguments
  await Promise.all(
    addresses.map(async (address) => {
      const votingPower = await ballotContract.votingPower(address);
      console.log(
        `Address: ${address} - Voting Power: ${ethers.utils.formatEther(
          votingPower
        )}`
      );
    })
  );
}

checkingVotingPower().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
