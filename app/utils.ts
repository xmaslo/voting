import { Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import fs from "fs";

const ACCOUNT_KEY_PATH = "./temp/voteCountAcc.json";

export function getWalletFromEnvironment(customKeypairPath) {
    const customKeypair = Keypair.fromSecretKey(
        new Uint8Array(
            JSON.parse(
                fs.readFileSync(customKeypairPath, "utf8")
            )
        )
    );

    return customKeypair;
}

export function writeVoteCountAccToEnv() {
    const voteCountAccount = anchor.web3.Keypair.generate();
    
    fs.writeFileSync(
        ACCOUNT_KEY_PATH, 
        JSON.stringify(Array.from(voteCountAccount.secretKey), null, 2), 
        'utf8'
    );

    return voteCountAccount;
}
