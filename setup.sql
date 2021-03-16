-- drop existing table
DROP TABLE IF EXISTS signatures;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    first           VARCHAR(255) NOT NULL,
    last            VARCHAR(255) NOT NULL,
    email           VARCHAR(50) NOT NULL UNIQUE,
    password_hash    VARCHAR NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- then we create a new table:
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
    signature TEXT NOT NULL CHECK (signature != '')
);

--first VARCHAR(255) NOT NULL, 
--last VARCHAR(255) NOT NULL,