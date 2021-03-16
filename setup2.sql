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

CREATE TABLE signatures (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL UNIQUE REFERENCES users (id),
    signature   TEXT NOT NULL CHECK (signature != '')
);

INSERT INTO users (first, last, email, password_hash) VALUES ('john', 'doe', 'john@doe.com', 'h4$$$h');
INSERT INTO users (first, last, email, password_hash) VALUES ('jela', 'vela', 'vela@doe.com', 'hpp$$$h');
INSERT INTO users (first, last, email, password_hash) VALUES ('miki', 'ori', 'miki@doe.com', 'oop$$$h');


-- INSERT INTO signatures (user_id, signature) VALUES (4, 'data:image/png;base64,bla'); --
INSERT INTO signatures (user_id, signature) VALUES (1, 'data:image/png;base64,bla');
INSERT INTO signatures (user_id, signature) VALUES (3, 'data:image/png;base64,bla');
INSERT INTO signatures (user_id, signature) VALUES (3, 'data:image/png;base64,bla');
 

-- INSERT INTO signatures (user_id, signature) VALUES (123, 'data:image/png;base64,bluh'); 

SELECT * FROM users; 
SELECT * FROM signatures; 
SELECT id FROM users WHERE email = 'john@doe.com';




