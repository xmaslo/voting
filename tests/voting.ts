import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { assert } from "chai";
import { getWalletFromEnvironment } from "../app/utils";

describe("voting", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Voting as Program<Voting>;
  const voteCountAccount = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    await program.methods
      .initialize()
      .accounts({
        voteCount: voteCountAccount.publicKey,
      })
      .signers([voteCountAccount])
      .rpc();
    
    const voteCountData = await program.account.voteCount.fetch(voteCountAccount.publicKey);
    assert(voteCountData.counter.eq( new anchor.BN(0)));
    assert(voteCountData.owner.toBase58() == anchor.AnchorProvider.env().publicKey.toBase58());
    assert(voteCountData.open == true);
  });

  it("Voted!", async () => {
    await program.methods
      .vote()
      .accounts({
        voteCount: voteCountAccount.publicKey,
      })
      .rpc();
    
      const voteCountData = await program.account.voteCount.fetch(voteCountAccount.publicKey);
      assert(voteCountData.counter.eq( new anchor.BN(1)));
  });

  it("Cannot close not-owned program!", async () => {
    const customKeypair = getWalletFromEnvironment(
      "/home/xdavid/.config/solana/voter.json"
    );
  
    const customProvider = new anchor.AnchorProvider(
        anchor.AnchorProvider.env().connection,
        new anchor.Wallet(customKeypair),
        anchor.AnchorProvider.defaultOptions()
    );

    const otherProgram = new anchor.Program(
      anchor.workspace.Voting.idl,
      customProvider
    );

    try {
      await otherProgram.methods
        .closeVote()
        .accounts({ voteCount: voteCountAccount.publicKey })
        .rpc();
    } catch (error) {
      const voteCountData = await program.account.voteCount.fetch(voteCountAccount.publicKey);
      assert(voteCountData.open == true);
      return;
    }

    assert(false, "Expected error not thrown");
  });

  it("Closed vote", async () => {
    await program.methods
      .closeVote()
      .accounts({ voteCount: voteCountAccount.publicKey })
      .rpc();

    const voteCountData = await program.account.voteCount.fetch(voteCountAccount.publicKey);
    assert(voteCountData.open == false);
  });

  it("Cannot vote after close!", async () => {
    try {
      await program.methods
        .vote()
        .accounts({
          voteCount: voteCountAccount.publicKey,
        })
        .rpc();
    } catch (error) {
      return;
    }

    assert(false);
  });
});
