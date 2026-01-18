-- Word Learning App - PostgreSQL Initialization Script
-- Bu script container ilk oluşturulduğunda çalışır

-- pgvector extension'ını etkinleştir
CREATE EXTENSION IF NOT EXISTS vector;

-- Log
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed. pgvector extension enabled.';
END $$;
