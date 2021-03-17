const spicedPg = require("spiced-pg");
const { username, password, database } = require("./credentials.json");

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

function getSignatures() {
    return db
        .query(
            "SELECT users.first, users.last FROM signatures JOIN users ON signatures.user_id = users.id;"
        )
        .then((result) => result.rows);
}

function getSingleSignature(id) {
    return db
        .query(`SELECT signature FROM signatures WHERE user_id = $1`, [id]) // .query("SELECT * FROM signatures WHERE id = $1", [id])
        .then((result) => result.rows[0].signature)
        .catch((error) => console.log("error", error));
}

function getSignatureByUserId(user_id) {
    return db
        .query("SELECT * FROM signatures WHERE id = $1", [user_id])
        .then((result) => result.rows[0]);
}

function createUser({ first, last, email, password_hash }) {
    return db
        .query(
            "INSERT INTO users (first, last, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id",
            [first, last, email, password_hash]
        )
        .then((result) => result.rows[0].id);
}

function createSignature({ user_id, signature }) {
    return db
        .query(
            "INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id",
            [user_id, signature]
        )
        .then((result) => result.rows[0].id);
}

module.exports = {
    createSignature,
    getSignatures,
    getSingleSignature,
    createUser,
};
