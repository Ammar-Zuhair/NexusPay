/**
 * dbSchema.js - Relational Database Architecture & DDL Schema Definitions (26 Tables)
 * Baseline Specification v9.0 - Standardized on ULIDs, DECIMAL(16,4) precision & explicit FK constraints.
 */

export const DB_SCHEMA = {
  version: '9.0.0',
  tablesCount: 26,
  tables: [
    {
      name: 'users',
      category: 'AUTH_RBAC',
      description: 'Customer and Administrator accounts',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true, constraints: 'ULID Identifier (CW-01J4X8B9-99A102)' },
        { name: 'email', type: 'VARCHAR(255)', unique: true, constraints: 'NOT NULL' },
        { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
        { name: 'full_name', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'role_code', type: 'VARCHAR(50)', fk: 'roles(code)', constraints: 'NOT NULL' },
        { name: 'status', type: 'VARCHAR(30)', constraints: "DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'))" },
        { name: 'is_2fa_enabled', type: 'BOOLEAN', constraints: 'DEFAULT FALSE' },
        { name: 'deleted_at', type: 'TIMESTAMPTZ', constraints: 'Soft Delete Timestamp' },
        { name: 'deleted_by', type: 'VARCHAR(35)', constraints: 'Admin Actor ULID' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_users_email (email)', 'idx_users_status (status)']
    },
    {
      name: 'roles',
      category: 'AUTH_RBAC',
      description: 'System roles (Super Admin, Finance Manager, Support Agent, Operations Manager, Developer, Analyst)',
      columns: [
        { name: 'code', type: 'VARCHAR(50)', pk: true, constraints: 'PRIMARY KEY' },
        { name: 'title', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'description', type: 'TEXT' }
      ],
      indexes: ['idx_roles_code (code)']
    },
    {
      name: 'permissions',
      category: 'AUTH_RBAC',
      description: 'Granular system permissions',
      columns: [
        { name: 'code', type: 'VARCHAR(100)', pk: true, constraints: 'PRIMARY KEY' },
        { name: 'module', type: 'VARCHAR(50)', constraints: 'NOT NULL' }
      ],
      indexes: ['idx_permissions_module (module)']
    },
    {
      name: 'role_permissions',
      category: 'AUTH_RBAC',
      description: 'Junction table linking roles and permissions',
      columns: [
        { name: 'role_code', type: 'VARCHAR(50)', fk: 'roles(code)', constraints: 'ON DELETE CASCADE' },
        { name: 'permission_code', type: 'VARCHAR(100)', fk: 'permissions(code)', constraints: 'ON DELETE CASCADE' }
      ],
      indexes: ['idx_role_perm (role_code, permission_code)']
    },
    {
      name: 'user_sessions',
      category: 'AUTH_RBAC',
      description: 'JWT User Access & Refresh Sessions',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'user_id', type: 'VARCHAR(35)', fk: 'users(id)', constraints: 'ON DELETE CASCADE' },
        { name: 'access_token_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
        { name: 'refresh_token_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
        { name: 'device_fingerprint', type: 'VARCHAR(255)' },
        { name: 'ip_address', type: 'VARCHAR(45)' },
        { name: 'expires_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL' }
      ],
      indexes: ['idx_user_sessions_user (user_id)']
    },
    {
      name: 'wallets',
      category: 'FINANCIAL',
      description: 'User and Vendor financial wallets',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'user_id', type: 'VARCHAR(35)', fk: 'users(id)', unique: true, constraints: 'ON DELETE RESTRICT' },
        { name: 'available_balance', type: 'DECIMAL(16,4)', constraints: 'DEFAULT 0.0000 CHECK (available_balance >= 0)' },
        { name: 'held_balance', type: 'DECIMAL(16,4)', constraints: 'DEFAULT 0.0000 CHECK (held_balance >= 0)' },
        { name: 'currency', type: 'VARCHAR(10)', constraints: "DEFAULT 'USD'" }
      ],
      indexes: ['idx_wallets_user (user_id)']
    },
    {
      name: 'marketplace_vendors',
      category: 'MARKETPLACE',
      description: 'Third-party vendors selling digital items on platform',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'vendor_name', type: 'VARCHAR(150)', constraints: 'NOT NULL' },
        { name: 'commission_percent', type: 'DECIMAL(5,2)', constraints: 'DEFAULT 5.00' },
        { name: 'wallet_id', type: 'VARCHAR(35)', fk: 'wallets(id)', constraints: 'NOT NULL ON DELETE RESTRICT' },
        { name: 'status', type: 'VARCHAR(30)', constraints: "DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'SUSPENDED'))" },
        { name: 'deleted_at', type: 'TIMESTAMPTZ' },
        { name: 'deleted_by', type: 'VARCHAR(35)' }
      ],
      indexes: ['idx_vendors_wallet (wallet_id)']
    },
    {
      name: 'categories',
      category: 'CATALOG',
      description: 'Product Categories (Game Top-Up, Subscriptions, Gift Cards, Licenses)',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'slug', type: 'VARCHAR(100)', unique: true, constraints: 'NOT NULL' },
        { name: 'title_json', type: 'JSONB', constraints: 'NOT NULL' },
        { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' },
        { name: 'deleted_at', type: 'TIMESTAMPTZ' }
      ],
      indexes: ['idx_categories_slug (slug)']
    },
    {
      name: 'products',
      category: 'CATALOG',
      description: 'Marketplace digital products',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'category_id', type: 'VARCHAR(35)', fk: 'categories(id)', constraints: 'ON DELETE RESTRICT' },
        { name: 'title_json', type: 'JSONB', constraints: 'NOT NULL' },
        { name: 'slug', type: 'VARCHAR(150)', unique: true, constraints: 'NOT NULL' },
        { name: 'product_type', type: 'VARCHAR(50)', constraints: "NOT NULL CHECK (product_type IN ('DIRECT_TOPUP', 'VOUCHER_CODE', 'SUBSCRIPTION', 'LICENSE_KEY', 'MOBILE_RECHARGE'))" },
        { name: 'base_cost', type: 'DECIMAL(16,4)', constraints: 'NOT NULL CHECK (base_cost >= 0)' },
        { name: 'profit_margin_percent', type: 'DECIMAL(5,2)', constraints: 'NOT NULL DEFAULT 10.00' },
        { name: 'sale_price', type: 'DECIMAL(16,4)', constraints: 'NOT NULL CHECK (sale_price >= 0)' },
        { name: 'currency', type: 'VARCHAR(10)', constraints: "DEFAULT 'USD'" },
        { name: 'is_available', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' },
        { name: 'deleted_at', type: 'TIMESTAMPTZ' }
      ],
      indexes: ['idx_products_category (category_id)', 'idx_products_slug (slug)']
    },
    {
      name: 'inventory_items',
      category: 'CATALOG',
      description: 'Digital Codes & Secret Key Reservations',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'product_id', type: 'VARCHAR(35)', fk: 'products(id)', constraints: 'ON DELETE RESTRICT' },
        { name: 'secret_code_encrypted', type: 'TEXT', constraints: 'NOT NULL' },
        { name: 'encryption_version', type: 'VARCHAR(20)', constraints: "DEFAULT 'v1-aes-256-gcm'" },
        { name: 'serial_number', type: 'VARCHAR(100)' },
        { name: 'status', type: 'VARCHAR(30)', constraints: "DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'SOLD', 'EXPIRED'))" },
        { name: 'reserved_by_order_id', type: 'VARCHAR(35)' },
        { name: 'reserved_until', type: 'TIMESTAMPTZ' }
      ],
      indexes: ['idx_inventory_product_status (product_id, status)']
    },
    {
      name: 'providers',
      category: 'SUPPLIERS',
      description: 'External API Suppliers (FastPay, UniPin, GlobalCodes)',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'name', type: 'VARCHAR(100)', unique: true, constraints: 'NOT NULL' },
        { name: 'code', type: 'VARCHAR(50)', unique: true, constraints: 'NOT NULL' },
        { name: 'driver_class', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'base_url', type: 'TEXT', constraints: 'NOT NULL' },
        { name: 'balance', type: 'DECIMAL(16,4)', constraints: 'DEFAULT 0.0000' },
        { name: 'priority_weight', type: 'INT', constraints: 'DEFAULT 50' },
        { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' },
        { name: 'in_maintenance', type: 'BOOLEAN', constraints: 'DEFAULT FALSE' },
        { name: 'deleted_at', type: 'TIMESTAMPTZ' }
      ],
      indexes: ['idx_providers_code (code)']
    },
    {
      name: 'provider_products',
      category: 'SUPPLIERS',
      description: 'Junction table mapping catalog items to supplier SKUs & stock',
      columns: [
        { name: 'provider_id', type: 'VARCHAR(35)', fk: 'providers(id)', constraints: 'ON DELETE CASCADE' },
        { name: 'product_id', type: 'VARCHAR(35)', fk: 'products(id)', constraints: 'ON DELETE CASCADE' },
        { name: 'provider_sku', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'provider_cost', type: 'DECIMAL(16,4)', constraints: 'NOT NULL' },
        { name: 'provider_stock', type: 'INT', constraints: 'DEFAULT 0' },
        { name: 'last_sync_at', type: 'TIMESTAMPTZ' }
      ],
      indexes: ['idx_provider_products_sync (last_sync_at)']
    },
    {
      name: 'circuit_breaker_states',
      category: 'SUPPLIERS',
      description: 'State tracking for 3-State Circuit Breaker per provider',
      columns: [
        { name: 'provider_id', type: 'VARCHAR(35)', pk: true, fk: 'providers(id)', constraints: 'ON DELETE CASCADE' },
        { name: 'state', type: 'VARCHAR(20)', constraints: "DEFAULT 'CLOSED' CHECK (state IN ('CLOSED', 'OPEN', 'HALF_OPEN'))" },
        { name: 'consecutive_failures', type: 'INT', constraints: 'DEFAULT 0' },
        { name: 'cooldown_until', type: 'TIMESTAMPTZ' }
      ],
      indexes: ['idx_cb_state (state)']
    },
    {
      name: 'orders',
      category: 'ORDERS',
      description: 'Normalized Order Transaction Headers (16-State FSM)',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'order_number', type: 'VARCHAR(50)', unique: true, constraints: 'NOT NULL' },
        { name: 'correlation_id', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'idempotency_key', type: 'VARCHAR(100)', unique: true, constraints: 'NOT NULL' },
        { name: 'user_id', type: 'VARCHAR(35)', fk: 'users(id)', constraints: 'ON DELETE RESTRICT' },
        { name: 'provider_id', type: 'VARCHAR(35)', fk: 'providers(id)' },
        { name: 'status', type: 'VARCHAR(40)', constraints: 'NOT NULL' },
        { name: 'total_amount', type: 'DECIMAL(16,4)', constraints: 'NOT NULL' },
        { name: 'currency', type: 'VARCHAR(10)', constraints: "DEFAULT 'USD'" },
        { name: 'target_account_id', type: 'VARCHAR(255)' },
        { name: 'delivered_payload', type: 'JSONB' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_orders_correlation (correlation_id)', 'idx_orders_user_status (user_id, status)']
    },
    {
      name: 'order_items',
      category: 'ORDERS',
      description: 'Shopping cart line items per order',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'order_id', type: 'VARCHAR(35)', fk: 'orders(id)', constraints: 'ON DELETE CASCADE' },
        { name: 'product_id', type: 'VARCHAR(35)', fk: 'products(id)', constraints: 'ON DELETE RESTRICT' },
        { name: 'unit_price', type: 'DECIMAL(16,4)', constraints: 'NOT NULL' },
        { name: 'quantity', type: 'INT', constraints: 'NOT NULL DEFAULT 1 CHECK (quantity > 0)' }
      ],
      indexes: ['idx_order_items_order (order_id)']
    },
    {
      name: 'payments',
      category: 'PAYMENTS',
      description: 'Payment gateway transactions and raw response payloads',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'order_id', type: 'VARCHAR(35)', fk: 'orders(id)', constraints: 'ON DELETE RESTRICT' },
        { name: 'gateway_code', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
        { name: 'gateway_tx_id', type: 'VARCHAR(100)', unique: true, constraints: 'NOT NULL' },
        { name: 'amount', type: 'DECIMAL(16,4)', constraints: 'NOT NULL' },
        { name: 'currency', type: 'VARCHAR(10)', constraints: 'NOT NULL' },
        { name: 'status', type: 'VARCHAR(30)', constraints: "NOT NULL CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'))" },
        { name: 'gateway_response_payload', type: 'JSONB' }
      ],
      indexes: ['idx_payments_order (order_id)', 'idx_payments_status (status)']
    },
    {
      name: 'wallet_ledgers',
      category: 'FINANCIAL',
      description: 'Immutable Double-Entry Wallet Ledgers with transaction direction',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'wallet_id', type: 'VARCHAR(35)', fk: 'wallets(id)', constraints: 'ON DELETE RESTRICT' },
        { name: 'correlation_id', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'transaction_direction', type: 'VARCHAR(10)', constraints: "NOT NULL CHECK (transaction_direction IN ('DEBIT', 'CREDIT'))" },
        { name: 'entry_type', type: 'VARCHAR(20)', constraints: "NOT NULL CHECK (entry_type IN ('HOLD', 'CAPTURE', 'RELEASE', 'CREDIT', 'DEBIT'))" },
        { name: 'amount', type: 'DECIMAL(16,4)', constraints: 'NOT NULL CHECK (amount > 0)' },
        { name: 'balance_before', type: 'DECIMAL(16,4)', constraints: 'NOT NULL' },
        { name: 'balance_after', type: 'DECIMAL(16,4)', constraints: 'NOT NULL' },
        { name: 'reference_type', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
        { name: 'reference_id', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_wallet_ledgers_wallet_created (wallet_id, created_at)']
    },
    {
      name: 'chart_of_accounts',
      category: 'ACCOUNTING',
      description: 'General Ledger Chart of Accounts',
      columns: [
        { name: 'account_code', type: 'VARCHAR(20)', pk: true },
        { name: 'account_name', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'account_type', type: 'VARCHAR(30)', constraints: "NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'))" }
      ],
      indexes: ['idx_chart_accounts (account_code)']
    },
    {
      name: 'journal_entries',
      category: 'ACCOUNTING',
      description: 'Double-entry accounting journal entries',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'correlation_id', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'order_id', type: 'VARCHAR(35)', fk: 'orders(id)' },
        { name: 'debit_account', type: 'VARCHAR(20)', fk: 'chart_of_accounts(account_code)' },
        { name: 'debit_amount', type: 'DECIMAL(16,4)', constraints: 'NOT NULL' },
        { name: 'credit_account', type: 'VARCHAR(20)', fk: 'chart_of_accounts(account_code)' },
        { name: 'credit_amount', type: 'DECIMAL(16,4)', constraints: 'NOT NULL' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_journal_correlation (correlation_id)']
    },
    {
      name: 'inbox_messages',
      category: 'INFRASTRUCTURE',
      description: 'Idempotent Webhook Inbox deduplication store',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'dedupe_key', type: 'VARCHAR(255)', unique: true, constraints: 'NOT NULL' },
        { name: 'gateway_code', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
        { name: 'payload', type: 'JSONB', constraints: 'NOT NULL' },
        { name: 'processed_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_inbox_processed (processed_at)']
    },
    {
      name: 'outbox_events',
      category: 'INFRASTRUCTURE',
      description: 'Atomic Event Bus Outbox store',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'correlation_id', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'event_type', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'payload', type: 'JSONB', constraints: 'NOT NULL' },
        { name: 'status', type: 'VARCHAR(20)', constraints: "DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED'))" },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_outbox_status_created (status, created_at)']
    },
    {
      name: 'audit_logs',
      category: 'LOGGING',
      description: 'Tamper-Proof Audit logs with entity associations',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'actor_id', type: 'VARCHAR(35)' },
        { name: 'action', type: 'VARCHAR(100)' },
        { name: 'entity_type', type: 'VARCHAR(100)' },
        { name: 'entity_id', type: 'VARCHAR(35)' },
        { name: 'old_value', type: 'JSONB' },
        { name: 'new_value', type: 'JSONB' },
        { name: 'ip_address', type: 'VARCHAR(45)' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_audit_entity (entity_type, entity_id)']
    },
    {
      name: 'api_logs',
      category: 'LOGGING',
      description: 'API Request and Response Logs',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'correlation_id', type: 'VARCHAR(100)' },
        { name: 'endpoint', type: 'TEXT' },
        { name: 'method', type: 'VARCHAR(10)' },
        { name: 'request_body', type: 'JSONB' },
        { name: 'response_body', type: 'JSONB' },
        { name: 'status_code', type: 'INT' },
        { name: 'latency_ms', type: 'INT' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_api_cid (correlation_id)']
    },
    {
      name: 'security_logs',
      category: 'LOGGING',
      description: 'Security & Auth Failure Events',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'user_id', type: 'VARCHAR(35)' },
        { name: 'event_type', type: 'VARCHAR(50)' },
        { name: 'ip_address', type: 'VARCHAR(45)' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_security_user (user_id)']
    },
    {
      name: 'payment_logs',
      category: 'LOGGING',
      description: 'Payment Gateway Webhook logs',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'correlation_id', type: 'VARCHAR(100)' },
        { name: 'gateway', type: 'VARCHAR(50)' },
        { name: 'payload', type: 'JSONB' },
        { name: 'status', type: 'VARCHAR(30)' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_payment_logs_cid (correlation_id)']
    },
    {
      name: 'order_logs',
      category: 'LOGGING',
      description: 'Order State Transition Logs',
      columns: [
        { name: 'id', type: 'VARCHAR(35)', pk: true },
        { name: 'order_id', type: 'VARCHAR(35)' },
        { name: 'correlation_id', type: 'VARCHAR(100)' },
        { name: 'from_state', type: 'VARCHAR(40)' },
        { name: 'to_state', type: 'VARCHAR(40)' },
        { name: 'note', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      indexes: ['idx_order_logs_order (order_id)']
    }
  ]
};
