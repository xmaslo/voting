use anchor_lang::prelude::*;

declare_id!("8D1Efb1EwVahXe3h1Qj21PtrECuEN3GNPnARdEU6tRE");

#[error_code]
pub enum VoteError {
    #[msg("Voting is closed")]
    VotingClosed,
}

#[program]
pub mod voting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        ctx.accounts.vote_count.owner = ctx.accounts.vote_owner.key();
        ctx.accounts.vote_count.open = true;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>) -> Result<()> {
        if !ctx.accounts.vote_count.open {
            return Err(VoteError::VotingClosed.into())
        }

        msg!("{:?} made a vote!", ctx.accounts.voter);
        ctx.accounts.vote_count.counter += 1;
        msg!("Current vote count is {:?}", ctx.accounts.vote_count.counter);
        Ok(())
    }

    pub fn close_vote(ctx: Context<CloseVote>) -> Result<()> {
        if ctx.accounts.vote_count.owner != ctx.accounts.vote_owner.key() {
            return Err(ProgramError::IllegalOwner.into());
        }

        ctx.accounts.vote_count.open = false;
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct VoteCount {
    pub owner: Pubkey,
    pub counter: u64,
    pub open: bool,
}

const DISCRIMINATOR: usize = 8;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub vote_owner: Signer<'info>,

    #[account(
        init,
        payer = vote_owner,
        space = DISCRIMINATOR + VoteCount::INIT_SPACE
    )]
    pub vote_count: Account<'info, VoteCount>,
    
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub vote_count: Account<'info, VoteCount>,

    #[account(mut)]
    pub voter: Signer<'info>
}

#[derive(Accounts)]
pub struct CloseVote<'info> {
    #[account(mut)]
    pub vote_count: Account<'info, VoteCount>,

    #[account(mut)]
    pub vote_owner: Signer<'info>,
}
