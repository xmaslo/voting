import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { getWalletFromEnvironment } from "./utils"

const customKeypair = getWalletFromEnvironment(
    "/home/xdavid/.config/solana/voter.json"
);

const customProvider = new anchor.AnchorProvider(
    anchor.AnchorProvider.env().connection,
    new anchor.Wallet(customKeypair),
    anchor.AnchorProvider.defaultOptions()
);

anchor.setProvider(customProvider);
const program = anchor.workspace.Voting as Program<Voting>;

async function vote() {
    const voteCountAccount = getWalletFromEnvironment("./app/voteCountAcc.json");
    const tx = await program.methods
      .vote()
      .accounts({
        voteCount: voteCountAccount.publicKey,
      })
      .rpc();
    
    console.log("Your transaction signature", tx);
}

vote()