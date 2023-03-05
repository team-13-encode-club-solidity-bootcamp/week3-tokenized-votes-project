# Tokenized Ballot Project - Encode Club Solidity Bootcamp Week 3

With this app you can:

- Deploy the token votes and the ballot contract

- Minting the tokens votes

- Transfer the token votes to the people

- Delegating your voting power to yourself or other people

- Voting your choice

- Check the result and the proposal winner

## Installation

1. Clone this repo

   ```sh
   git clone https://github.com/team-13-encode-club-solidity-bootcamp/week3-tokenized-votes-project.git
   ```

2. Mount the directory using terminal.

   ```sh
   cd week3-tokenized-votes-project
   ```

3. Install dependencies via terminal

   ```sh
   yarn install
   ```

4. Compile the contract

   ```sh
   yarn hardhat compile
   ```

5. Create `.env` file in root project directory with contents according to the example (see [.env.example](/.env.example)) ensure you fill `PRIVATE_KEY` & `ALCHEMY_API_KEY` with your data

## How to run scripts

1. Token Deployment include minting and self delegated voting power to deployer

   ```sh
   yarn run ts-node --files scripts/tokenDeployment.ts <amountToMint>
   ```

2. Transfer token to other people

   ```sh
   yarn run ts-node --files scripts/transferToken.ts <tokenContractAddress> <walletDestinationAddress> <amountToTransfer>
   ```

3. Delegate voting power (people can choose to self delegated or delegated to another person)

   ```sh
   yarn run ts-node --files scripts/delegateVotingPower.ts <tokenContractAddress> <walletAddressToDelegateTheVotingPower>
   ```

4. Deploy ballot contract with target block number in the future or past

   ```sh
   yarn run ts-node --files scripts/ballotDeployment.ts <tokenContractAddress> <targetBlockNumber> "arg1" "arg2" "arg3"
   ```

5. Checking the voting power of multiple addresses

   ```sh
   yarn run ts-node --files scripts/checkingVotingPower.ts <BALLOT_ADDRESS> <walletAddressToCheck1> <walletAddressToCheck2> <walletAddressToCheck3> ... <walletAddressToCheckn>
   ```

6. Voting your choice (Not testing yet in goerli network)

   ```sh
   yarn run ts-node --files scripts/voting.ts 0xbE12cE790C46f88Ed31eBF79cA02E6D917Fa61d9 0 1000
   ```

7. Querying results (Not yet implemented)
