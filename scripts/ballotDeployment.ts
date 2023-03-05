import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
dotenv.config();

// To run this script:
// yarn run ts-node --files scripts/ballotDeployment.ts <tokenContractAddress> <targetBlockNumber> "arg1" "arg2" "arg3"
// yarn run ts-node --files scripts/ballotDeployment.ts 0x56da1240DB296aAf28848A510F29482801615B0D 8600851 "chocolate" "strawberry" "banana"

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  // console.log(bytes32Array);
  return bytes32Array;
}

async function ballotDeployment() {
  const args = process.argv;
  // console.log(args);
  const tokenContractAddress = args[2];
  const targetBlockNumber = parseInt(args[3]);
  const proposals = args.slice(4);
  // console.log(proposals);
  if (!tokenContractAddress)
    throw new Error("Missing parameter : token contract address");
  if (!targetBlockNumber) throw new Error("Missing parameter : block number");
  if (!proposals.length) throw new Error("Missing parameter : proposals");
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

  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  // Deploy TokenizedBallot
  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContract = await ballotContractFactory.deploy(
    convertStringArrayToBytes32(proposals),
    tokenContractAddress,
    targetBlockNumber
  );
  const deployTxReceipt = await ballotContract.deployTransaction.wait();
  console.log(
    `The contract was deployed at the address ${ballotContract.address}`
  );
  console.log({ deployTxReceipt });
}

ballotDeployment().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
