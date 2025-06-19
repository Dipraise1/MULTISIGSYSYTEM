use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("MSigWa11etProgram11111111111111111111111111");

#[program]
pub mod multisig_wallet {
    use super::*;

    pub fn initialize_wallet(
        ctx: Context<InitializeWallet>,
        owners: Vec<Pubkey>,
        threshold: u8,
        time_lock_duration: i64,
        bump: u8,
    ) -> Result<()> {
        require!(
            owners.len() > 0 && owners.len() <= 50,
            ErrorCode::InvalidOwnersCount
        );
        require!(
            threshold > 0 && threshold <= owners.len() as u8,
            ErrorCode::InvalidThreshold
        );

        let wallet = &mut ctx.accounts.wallet;
        wallet.owners = owners.clone();
        wallet.threshold = threshold;
        wallet.time_lock_duration = time_lock_duration;
        wallet.nonce = 0;
        wallet.bump = bump;
        wallet.is_paused = false;

        emit!(WalletInitialized {
            wallet: wallet.key(),
            owners,
            threshold,
            time_lock_duration,
        });

        Ok(())
    }

    pub fn create_transaction(
        ctx: Context<CreateTransaction>,
        destination: Pubkey,
        amount: u64,
        data: Vec<u8>,
        token_mint: Option<Pubkey>,
    ) -> Result<()> {
        let wallet = &ctx.accounts.wallet;
        require!(!wallet.is_paused, ErrorCode::WalletPaused);
        require!(
            wallet.owners.contains(&ctx.accounts.proposer.key()),
            ErrorCode::NotOwner
        );

        let transaction = &mut ctx.accounts.transaction;
        transaction.wallet = wallet.key();
        transaction.destination = destination;
        transaction.amount = amount;
        transaction.data = data;
        transaction.token_mint = token_mint;
        transaction.proposer = ctx.accounts.proposer.key();
        transaction.is_executed = false;
        transaction.confirmations = vec![ctx.accounts.proposer.key()];
        transaction.created_at = Clock::get()?.unix_timestamp;
        transaction.requires_all_confirmations = false;

        emit!(TransactionCreated {
            transaction: transaction.key(),
            wallet: wallet.key(),
            proposer: ctx.accounts.proposer.key(),
            destination,
            amount,
            token_mint,
        });

        Ok(())
    }

    pub fn confirm_transaction(ctx: Context<ConfirmTransaction>) -> Result<()> {
        let wallet = &ctx.accounts.wallet;
        let transaction = &mut ctx.accounts.transaction;

        require!(!wallet.is_paused, ErrorCode::WalletPaused);
        require!(
            wallet.owners.contains(&ctx.accounts.owner.key()),
            ErrorCode::NotOwner
        );
        require!(!transaction.is_executed, ErrorCode::TransactionExecuted);
        require!(
            !transaction.confirmations.contains(&ctx.accounts.owner.key()),
            ErrorCode::AlreadyConfirmed
        );

        transaction.confirmations.push(ctx.accounts.owner.key());

        emit!(TransactionConfirmed {
            transaction: transaction.key(),
            owner: ctx.accounts.owner.key(),
            confirmations: transaction.confirmations.len() as u8,
        });

        Ok(())
    }

    pub fn execute_transaction(ctx: Context<ExecuteTransaction>) -> Result<()> {
        let wallet = &ctx.accounts.wallet;
        let transaction = &mut ctx.accounts.transaction;

        require!(!wallet.is_paused, ErrorCode::WalletPaused);
        require!(!transaction.is_executed, ErrorCode::TransactionExecuted);
        
        let required_confirmations = if transaction.requires_all_confirmations {
            wallet.owners.len()
        } else {
            wallet.threshold as usize
        };

        require!(
            transaction.confirmations.len() >= required_confirmations,
            ErrorCode::InsufficientConfirmations
        );

        // Check time lock
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time >= transaction.created_at + wallet.time_lock_duration,
            ErrorCode::TimeLockNotExpired
        );

        transaction.is_executed = true;

        emit!(TransactionExecuted {
            transaction: transaction.key(),
            executor: ctx.accounts.executor.key(),
        });

        Ok(())
    }
}

// Account structures
#[account]
pub struct Wallet {
    pub owners: Vec<Pubkey>,
    pub threshold: u8,
    pub time_lock_duration: i64,
    pub nonce: u64,
    pub bump: u8,
    pub is_paused: bool,
}

#[account]
pub struct Transaction {
    pub wallet: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
    pub data: Vec<u8>,
    pub token_mint: Option<Pubkey>,
    pub proposer: Pubkey,
    pub is_executed: bool,
    pub confirmations: Vec<Pubkey>,
    pub created_at: i64,
    pub requires_all_confirmations: bool,
}

// Context structures
#[derive(Accounts)]
#[instruction(owners: Vec<Pubkey>, threshold: u8, time_lock_duration: i64, bump: u8)]
pub struct InitializeWallet<'info> {
    #[account(
        init,
        seeds = [b"wallet", authority.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + 4 + 32 * 50 + 1 + 8 + 8 + 1 + 1
    )]
    pub wallet: Account<'info, Wallet>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    pub wallet: Account<'info, Wallet>,
    #[account(
        init,
        payer = proposer,
        space = 8 + 32 + 32 + 8 + 4 + 1024 + 33 + 32 + 1 + 4 + 32 * 50 + 8 + 1
    )]
    pub transaction: Account<'info, Transaction>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmTransaction<'info> {
    pub wallet: Account<'info, Wallet>,
    #[account(mut)]
    pub transaction: Account<'info, Transaction>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteTransaction<'info> {
    pub wallet: Account<'info, Wallet>,
    #[account(mut)]
    pub transaction: Account<'info, Transaction>,
    pub executor: Signer<'info>,
}

// Events
#[event]
pub struct WalletInitialized {
    pub wallet: Pubkey,
    pub owners: Vec<Pubkey>,
    pub threshold: u8,
    pub time_lock_duration: i64,
}

#[event]
pub struct TransactionCreated {
    pub transaction: Pubkey,
    pub wallet: Pubkey,
    pub proposer: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
    pub token_mint: Option<Pubkey>,
}

#[event]
pub struct TransactionConfirmed {
    pub transaction: Pubkey,
    pub owner: Pubkey,
    pub confirmations: u8,
}

#[event]
pub struct TransactionExecuted {
    pub transaction: Pubkey,
    pub executor: Pubkey,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid number of owners")]
    InvalidOwnersCount,
    #[msg("Invalid threshold")]
    InvalidThreshold,
    #[msg("Not an owner")]
    NotOwner,
    #[msg("Transaction already executed")]
    TransactionExecuted,
    #[msg("Already confirmed")]
    AlreadyConfirmed,
    #[msg("Insufficient confirmations")]
    InsufficientConfirmations,
    #[msg("Time lock not expired")]
    TimeLockNotExpired,
    #[msg("Wallet is paused")]
    WalletPaused,
} 