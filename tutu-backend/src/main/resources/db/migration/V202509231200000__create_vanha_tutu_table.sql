CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE vanha_tutu (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_json JSONB NOT NULL
);
