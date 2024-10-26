import * as dotenv from 'dotenv'
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { getWalletFromEnvironment, writeVoteCountAccToEnv  } from "./utils"

dotenv.config()

const customKeypair = getWalletFromEnvironment(
    process.env.VOTE_OWNER_SECRET_PATH
);

const customProvider = new anchor.AnchorProvider(
    anchor.AnchorProvider.env().connection,
    new anchor.Wallet(customKeypair),
    anchor.AnchorProvider.defaultOptions()
);

anchor.setProvider(customProvider);
const program = anchor.workspace.Voting as Program<Voting>;

async function initialize() {
    const voteCountAccount = writeVoteCountAccToEnv();

    const tx = await program.methods
        .initialize()
        .accounts({
            voteCount: voteCountAccount.publicKey,
        })
        .signers([voteCountAccount])
        .rpc();
    console.log("Your transaction signature", tx);
}

initialize()
