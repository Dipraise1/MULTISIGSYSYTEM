use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::collections::HashMap;

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

        // Check spending limits
        if !is_within_spending_limit(wallet, token_mint, amount)? {
            transaction.requires_all_confirmations = true;
        }

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

        // Try to execute if threshold is met
        if can_execute_transaction(wallet, transaction)? {
            execute_transaction_internal(ctx)?;
        }

        Ok(())
    }

    pub fn revoke_confirmation(ctx: Context<RevokeConfirmation>) -> Result<()> {
        let wallet = &ctx.accounts.wallet;
        let transaction = &mut ctx.accounts.transaction;

        require!(!wallet.is_paused, ErrorCode::WalletPaused);
        require!(
            wallet.owners.contains(&ctx.accounts.owner.key()),
            ErrorCode::NotOwner
        );
        require!(!transaction.is_executed, ErrorCode::TransactionExecuted);
        require!(
            transaction.confirmations.contains(&ctx.accounts.owner.key()),
            ErrorCode::NotConfirmed
        );

        transaction.confirmations.retain(|&x| x != ctx.accounts.owner.key());

        emit!(TransactionRevoked {
            transaction: transaction.key(),
            owner: ctx.accounts.owner.key(),
        });

        Ok(())
    }

    pub fn execute_transaction(ctx: Context<ExecuteTransaction>) -> Result<()> {
        let wallet = &ctx.accounts.wallet;
        let transaction = &mut ctx.accounts.transaction;

        require!(!wallet.is_paused, ErrorCode::WalletPaused);
        require!(
            wallet.owners.contains(&ctx.accounts.executor.key()),
            ErrorCode::NotOwner
        );
        require!(!transaction.is_executed, ErrorCode::TransactionExecuted);
        require!(
            can_execute_transaction(wallet, transaction)?,
            ErrorCode::InsufficientConfirmations
        );

        // Check time lock
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            current_time >= transaction.created_at + wallet.time_lock_duration,
            ErrorCode::TimeLockNotExpired
        );

        execute_transaction_internal(ctx)?;

        Ok(())
    }

    pub fn add_owner(ctx: Context<ModifyOwners>, new_owner: Pubkey) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        require!(
            wallet.owners.len() < 50,
            ErrorCode::TooManyOwners
        );
        require!(
            !wallet.owners.contains(&new_owner),
            ErrorCode::OwnerAlreadyExists
        );

        wallet.owners.push(new_owner);

        emit!(OwnerAdded {
            wallet: wallet.key(),
            owner: new_owner,
        });

        Ok(())
    }

    pub fn remove_owner(ctx: Context<ModifyOwners>, owner_to_remove: Pubkey) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        require!(
            wallet.owners.contains(&owner_to_remove),
            ErrorCode::OwnerNotFound
        );
        require!(
            wallet.owners.len() > 1,
            ErrorCode::CannotRemoveLastOwner
        );

        wallet.owners.retain(|&x| x != owner_to_remove);

        // Adjust threshold if necessary
        if wallet.threshold > wallet.owners.len() as u8 {
            wallet.threshold = wallet.owners.len() as u8;
        }

        emit!(OwnerRemoved {
            wallet: wallet.key(),
            owner: owner_to_remove,
        });

        Ok(())
    }

    pub fn change_threshold(ctx: Context<ChangeThreshold>, new_threshold: u8) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        require!(
            new_threshold > 0 && new_threshold <= wallet.owners.len() as u8,
            ErrorCode::InvalidThreshold
        );

        wallet.threshold = new_threshold;

        emit!(ThresholdChanged {
            wallet: wallet.key(),
            threshold: new_threshold,
        });

        Ok(())
    }

    pub fn set_spending_limit(
        ctx: Context<SetSpendingLimit>,
        token_mint: Option<Pubkey>,
        daily_limit: u64,
        monthly_limit: u64,
    ) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        let spending_limit = &mut ctx.accounts.spending_limit;

        spending_limit.wallet = wallet.key();
        spending_limit.token_mint = token_mint;
        spending_limit.daily_limit = daily_limit;
        spending_limit.monthly_limit = monthly_limit;
        spending_limit.daily_spent = 0;
        spending_limit.monthly_spent = 0;
        spending_limit.last_reset_day = Clock::get()?.unix_timestamp / 86400;
        spending_limit.last_reset_month = Clock::get()?.unix_timestamp / (86400 * 30);

        emit!(SpendingLimitSet {
            wallet: wallet.key(),
            token_mint,
            daily_limit,
            monthly_limit,
        });

        Ok(())
    }

    pub fn pause_wallet(ctx: Context<PauseWallet>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        require!(
            wallet.owners.contains(&ctx.accounts.owner.key()),
            ErrorCode::NotOwner
        );

        wallet.is_paused = true;

        emit!(WalletPaused {
            wallet: wallet.key(),
        });

        Ok(())
    }

    pub fn unpause_wallet(ctx: Context<UnpauseWallet>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        require!(
            wallet.owners.contains(&ctx.accounts.owner.key()),
            ErrorCode::NotOwner
        );

        wallet.is_paused = false;

        emit!(WalletUnpaused {
            wallet: wallet.key(),
        });

        Ok(())
    }
}

// Helper functions
fn can_execute_transaction(wallet: &Wallet, transaction: &Transaction) -> Result<bool> {
    let required_confirmations = if transaction.requires_all_confirmations {
        wallet.owners.len()
    } else {
        wallet.threshold as usize
    };

    Ok(transaction.confirmations.len() >= required_confirmations)
}

fn execute_transaction_internal(ctx: Context<ExecuteTransaction>) -> Result<()> {
    let transaction = &mut ctx.accounts.transaction;
    transaction.is_executed = true;

    // Handle SOL transfer
    if transaction.token_mint.is_none() {
        let from_account = &ctx.accounts.wallet_account;
        let to_account = &ctx.accounts.destination_account;

        **from_account.try_borrow_mut_lamports()? -= transaction.amount;
        **to_account.try_borrow_mut_lamports()? += transaction.amount;
    } else {
        // Handle SPL token transfer
        let cpi_accounts = Transfer {
            from: ctx.accounts.wallet_token_account.to_account_info(),
            to: ctx.accounts.destination_token_account.to_account_info(),
            authority: ctx.accounts.wallet_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, transaction.amount)?;
    }

    // Update spending limits
    update_spending_limit(
        &ctx.accounts.spending_limit,
        transaction.token_mint,
        transaction.amount,
    )?;

    emit!(TransactionExecuted {
        transaction: transaction.key(),
        executor: ctx.accounts.executor.key(),
    });

    Ok(())
}

fn is_within_spending_limit(
    _wallet: &Wallet,
    _token_mint: Option<Pubkey>,
    _amount: u64,
) -> Result<bool> {
    // Implementation would check against SpendingLimit account
    // For now, return true
    Ok(true)
}

fn update_spending_limit(
    _spending_limit: &SpendingLimit,
    _token_mint: Option<Pubkey>,
    _amount: u64,
) -> Result<()> {
    // Implementation would update spending counters
    Ok(())
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

#[account]
pub struct SpendingLimit {
    pub wallet: Pubkey,
    pub token_mint: Option<Pubkey>,
    pub daily_limit: u64,
    pub monthly_limit: u64,
    pub daily_spent: u64,
    pub monthly_spent: u64,
    pub last_reset_day: i64,
    pub last_reset_month: i64,
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
        space = 8 + 32 * 50 + 1 + 8 + 8 + 1 + 1  // Discriminator + owners + threshold + time_lock + nonce + bump + is_paused
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
        space = 8 + 32 + 32 + 8 + 4 + 1024 + 33 + 32 + 1 + 4 + 32 * 50 + 8 + 1  // Basic fields + data + confirmations
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
pub struct RevokeConfirmation<'info> {
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
    #[account(mut)]
    pub wallet_account: AccountInfo<'info>,
    #[account(mut)]
    pub destination_account: AccountInfo<'info>,
    #[account(mut)]
    pub wallet_token_account: Option<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub destination_token_account: Option<Account<'info, TokenAccount>>,
    pub spending_limit: Account<'info, SpendingLimit>,
    pub executor: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ModifyOwners<'info> {
    #[account(mut)]
    pub wallet: Account<'info, Wallet>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ChangeThreshold<'info> {
    #[account(mut)]
    pub wallet: Account<'info, Wallet>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetSpendingLimit<'info> {
    pub wallet: Account<'info, Wallet>,
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 33 + 8 + 8 + 8 + 8 + 8 + 8
    )]
    pub spending_limit: Account<'info, SpendingLimit>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PauseWallet<'info> {
    #[account(mut)]
    pub wallet: Account<'info, Wallet>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct UnpauseWallet<'info> {
    #[account(mut)]
    pub wallet: Account<'info, Wallet>,
    pub owner: Signer<'info>,
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
pub struct TransactionRevoked {
    pub transaction: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct TransactionExecuted {
    pub transaction: Pubkey,
    pub executor: Pubkey,
}

#[event]
pub struct OwnerAdded {
    pub wallet: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct OwnerRemoved {
    pub wallet: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct ThresholdChanged {
    pub wallet: Pubkey,
    pub threshold: u8,
}

#[event]
pub struct SpendingLimitSet {
    pub wallet: Pubkey,
    pub token_mint: Option<Pubkey>,
    pub daily_limit: u64,
    pub monthly_limit: u64,
}

#[event]
pub struct WalletPaused {
    pub wallet: Pubkey,
}

#[event]
pub struct WalletUnpaused {
    pub wallet: Pubkey,
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
    #[msg("Not confirmed")]
    NotConfirmed,
    #[msg("Insufficient confirmations")]
    InsufficientConfirmations,
    #[msg("Time lock not expired")]
    TimeLockNotExpired,
    #[msg("Too many owners")]
    TooManyOwners,
    #[msg("Owner already exists")]
    OwnerAlreadyExists,
    #[msg("Owner not found")]
    OwnerNotFound,
    #[msg("Cannot remove last owner")]
    CannotRemoveLastOwner,
    #[msg("Wallet is paused")]
    WalletPaused,
} 