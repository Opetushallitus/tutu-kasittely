CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS vanha_tutu_migration (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_index INTEGER NOT NULL,
    total_chunks INTEGER NOT NULL,
    xml_chunk TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Index for efficient processing of unprocessed chunks
CREATE INDEX idx_vanha_tutu_migration_processed ON vanha_tutu_migration(processed, chunk_index);

-- Index for cleanup operations
CREATE INDEX idx_vanha_tutu_migration_created_at ON vanha_tutu_migration(created_at);
