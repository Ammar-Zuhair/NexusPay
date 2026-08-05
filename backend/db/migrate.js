/**
 * migrate.js - Executable PostgreSQL DDL Migration Runner
 * Automatically creates all 26 tables, ULID primary keys, DECIMAL(16,4) data types,
 * CHECK constraints, foreign keys, and query indexes.
 */

import { query } from '../config/database.js';

export const DDL_SCHEMA_QUERIES = [
  // 1. ROLES
  `CREATE TABLE IF NOT EXISTS roles (
    code VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT
  );`,

  // 2. PERMISSIONS
  `CREATE TABLE IF NOT EXISTS permissions (
    code VARCHAR(100) PRIMARY KEY,
    module VARCHAR(50) NOT NULL
  );`,

  // 3. ROLE_PERMISSIONS
  `CREATE TABLE IF NOT EXISTS role_permissions (
    role_code VARCHAR(50) NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
    permission_code VARCHAR(100) NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
    PRIMARY KEY (role_code, permission_code)
  );`,

  // 4. USERS
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(35) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    country_code VARCHAR(10) DEFAULT 'SA',
    role_code VARCHAR(50) NOT NULL REFERENCES roles(code),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION')),
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(35),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  `CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);`,

  // 5. USER_SESSIONS
  `CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(35) PRIMARY KEY,
    user_id VARCHAR(35) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMPTZ NOT NULL
  );`,

  // 6. WALLETS
  `CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(35) PRIMARY KEY,
    user_id VARCHAR(35) UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    available_balance DECIMAL(16,4) DEFAULT 0.0000 CHECK (available_balance >= 0),
    held_balance DECIMAL(16,4) DEFAULT 0.0000 CHECK (held_balance >= 0),
    currency VARCHAR(10) DEFAULT 'USD'
  );`,

  // 6b. WALLET_TOPUP_TRANSACTIONS
  `CREATE TABLE IF NOT EXISTS wallet_topup_transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(35) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_usd DECIMAL(16,4) NOT NULL CHECK (amount_usd > 0),
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(255),
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    gateway_response JSONB,
    country_code VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
  );`,
  `CREATE INDEX IF NOT EXISTS idx_topup_user_id ON wallet_topup_transactions(user_id);`,

  // 7. MARKETPLACE_VENDORS
  `CREATE TABLE IF NOT EXISTS marketplace_vendors (
    id VARCHAR(35) PRIMARY KEY,
    vendor_name VARCHAR(150) NOT NULL,
    commission_percent DECIMAL(5,2) DEFAULT 5.00,
    wallet_id VARCHAR(35) NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    status VARCHAR(30) DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'SUSPENDED')),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(35)
  );`,

  // 8. CATEGORIES
  `CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(35) PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
  );`,

  `CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(35) PRIMARY KEY,
    category_id VARCHAR(35) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title_json JSONB NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('DIRECT_TOPUP', 'VOUCHER_CODE', 'SUBSCRIPTION', 'LICENSE_KEY', 'MOBILE_RECHARGE')),
    base_cost DECIMAL(16,4) NOT NULL CHECK (base_cost >= 0),
    profit_margin_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    sale_price DECIMAL(16,4) NOT NULL CHECK (sale_price >= 0),
    image_url TEXT,
    country_code VARCHAR(10) DEFAULT 'GLOBAL',
    packages_json JSONB DEFAULT '[]'::jsonb,
    currency VARCHAR(10) DEFAULT 'USD',
    is_available BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
  );`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'GLOBAL';`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS packages_json JSONB DEFAULT '[]'::jsonb;`,
  `ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;`,

  // 10. INVENTORY_ITEMS
  `CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(35) PRIMARY KEY,
    product_id VARCHAR(35) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    secret_code_encrypted TEXT NOT NULL,
    encryption_version VARCHAR(20) DEFAULT 'v1-aes-256-gcm',
    serial_number VARCHAR(100),
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'SOLD', 'EXPIRED')),
    reserved_by_order_id VARCHAR(35),
    reserved_until TIMESTAMPTZ
  );`,

  // 11. PROVIDERS
  `CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(35) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    driver_class VARCHAR(100) NOT NULL,
    base_url TEXT NOT NULL,
    logo_url TEXT,
    balance DECIMAL(16,4) DEFAULT 0.0000,
    priority_weight INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    in_maintenance BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
  );`,
  `ALTER TABLE providers ADD COLUMN IF NOT EXISTS logo_url TEXT;`,

  // 12. PROVIDER_PRODUCTS
  `CREATE TABLE IF NOT EXISTS provider_products (
    provider_id VARCHAR(35) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    product_id VARCHAR(35) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    provider_sku VARCHAR(100) NOT NULL,
    provider_cost DECIMAL(16,4) NOT NULL,
    provider_stock INT DEFAULT 0,
    last_sync_at TIMESTAMPTZ,
    PRIMARY KEY (provider_id, product_id)
  );`,

  // 13. CIRCUIT_BREAKER_STATES
  `CREATE TABLE IF NOT EXISTS circuit_breaker_states (
    provider_id VARCHAR(35) PRIMARY KEY REFERENCES providers(id) ON DELETE CASCADE,
    state VARCHAR(20) DEFAULT 'CLOSED' CHECK (state IN ('CLOSED', 'OPEN', 'HALF_OPEN')),
    consecutive_failures INT DEFAULT 0,
    cooldown_until TIMESTAMPTZ
  );`,

  // 14. ORDERS (Supports both Registered Users and Guest Checkout)
  `CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(35) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    correlation_id VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(35) REFERENCES users(id) ON DELETE RESTRICT,
    is_guest BOOLEAN DEFAULT FALSE,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(45),
    provider_id VARCHAR(35) REFERENCES providers(id),
    status VARCHAR(40) NOT NULL,
    total_amount DECIMAL(16,4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    target_account_id VARCHAR(255),
    delivered_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 14B. WALLET TOPUPS (Site Balance Deposits)
  `CREATE TABLE IF NOT EXISTS wallet_topups (
    id VARCHAR(35) PRIMARY KEY,
    wallet_id VARCHAR(35) NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    amount DECIMAL(16,4) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'USD',
    gateway_code VARCHAR(50) NOT NULL,
    gateway_tx_id VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 15. ORDER_ITEMS
  `CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(35) PRIMARY KEY,
    order_id VARCHAR(35) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(35) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_price DECIMAL(16,4) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0)
  );`,

  // 16. PAYMENTS
  `CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(35) PRIMARY KEY,
    order_id VARCHAR(35) NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    gateway_code VARCHAR(50) NOT NULL,
    gateway_tx_id VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(16,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    gateway_response_payload JSONB
  );`,

  // 17. WALLET_LEDGERS
  `CREATE TABLE IF NOT EXISTS wallet_ledgers (
    id VARCHAR(35) PRIMARY KEY,
    wallet_id VARCHAR(35) NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    correlation_id VARCHAR(100) NOT NULL,
    transaction_direction VARCHAR(10) NOT NULL CHECK (transaction_direction IN ('DEBIT', 'CREDIT')),
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('HOLD', 'CAPTURE', 'RELEASE', 'CREDIT', 'DEBIT')),
    amount DECIMAL(16,4) NOT NULL CHECK (amount > 0),
    balance_before DECIMAL(16,4) NOT NULL,
    balance_after DECIMAL(16,4) NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 18. CHART_OF_ACCOUNTS
  `CREATE TABLE IF NOT EXISTS chart_of_accounts (
    account_code VARCHAR(20) PRIMARY KEY,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'))
  );`,

  // 19. JOURNAL_ENTRIES
  `CREATE TABLE IF NOT EXISTS journal_entries (
    id VARCHAR(35) PRIMARY KEY,
    correlation_id VARCHAR(100) NOT NULL,
    order_id VARCHAR(35) REFERENCES orders(id),
    debit_account VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    debit_amount DECIMAL(16,4) NOT NULL,
    credit_account VARCHAR(20) REFERENCES chart_of_accounts(account_code),
    credit_amount DECIMAL(16,4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 20. INBOX_MESSAGES
  `CREATE TABLE IF NOT EXISTS inbox_messages (
    id VARCHAR(35) PRIMARY KEY,
    dedupe_key VARCHAR(255) UNIQUE NOT NULL,
    gateway_code VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 21. OUTBOX_EVENTS
  `CREATE TABLE IF NOT EXISTS outbox_events (
    id VARCHAR(35) PRIMARY KEY,
    correlation_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 22. AUDIT_LOGS
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(35) PRIMARY KEY,
    actor_id VARCHAR(35),
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id VARCHAR(35),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 23. API_LOGS
  `CREATE TABLE IF NOT EXISTS api_logs (
    id VARCHAR(35) PRIMARY KEY,
    correlation_id VARCHAR(100),
    endpoint TEXT,
    method VARCHAR(10),
    request_body JSONB,
    response_body JSONB,
    status_code INT,
    latency_ms INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 24. SECURITY_LOGS
  `CREATE TABLE IF NOT EXISTS security_logs (
    id VARCHAR(35) PRIMARY KEY,
    user_id VARCHAR(35),
    event_type VARCHAR(50),
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 25. PAYMENT_LOGS
  `CREATE TABLE IF NOT EXISTS payment_logs (
    id VARCHAR(35) PRIMARY KEY,
    correlation_id VARCHAR(100),
    gateway VARCHAR(50),
    payload JSONB,
    status VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,

  // 26. ORDER_LOGS
  `CREATE TABLE IF NOT EXISTS order_logs (
    id VARCHAR(35) PRIMARY KEY,
    order_id VARCHAR(35),
    correlation_id VARCHAR(100),
    from_state VARCHAR(40),
    to_state VARCHAR(40),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,
  `INSERT INTO roles (code, title, description) VALUES ('USER', 'Regular User', 'Regular customer') ON CONFLICT (code) DO NOTHING;`,
  `INSERT INTO roles (code, title, description) VALUES ('ADMIN', 'Administrator', 'Platform administrator') ON CONFLICT (code) DO NOTHING;`
];

export async function runMigrations() {
  console.log('[MIGRATIONS] Starting DDL Schema Execution for 26 Tables...');
  let successCount = 0;

  for (const sql of DDL_SCHEMA_QUERIES) {
    try {
      await query(sql);
      successCount++;
    } catch (err) {
      console.warn('[MIGRATION STATEMENT NOTE]', err.message);
    }
  }

  console.log(`[MIGRATIONS] Successfully executed ${successCount} DDL statements.`);
  return { successCount, total: DDL_SCHEMA_QUERIES.length };
}

if (process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[MIGRATION CRITICAL FAIL]', err);
      process.exit(1);
    });
}
