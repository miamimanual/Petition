var spicedPg = require("spiced-pg");
const { username, password, database } = require("./credentials.json");

var db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

function createSignature(first, last, signature) {
    return db.query(
        "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)",
        [first, last, signature]
    );
}

function getSignatures(first, last, signature) {
    return db.query("SELECT * FROM signatures").then((result) => result.rows);
}

module.exports = { createSignature, getSignatures };
