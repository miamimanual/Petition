const spicedPg = require("spiced-pg");
const { username, password, database } = require("./credentials.json");

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

function createSignature({ first, last, signature }) {
    // before it was without {}
    return db.query(
        "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id",
        [first, last, signature]
    );

    //  .then((result) => result.rows[0].id);
}

function getSignatures() {
    return db.query("SELECT * FROM signatures").then((result) => result.rows);
}

function getSingleSignature(id) {
    return db
        .query(`SELECT signature FROM signatures WHERE id = ${id}`)
        .then((result) => result.rows[0].signature)
        .catch((error) => console.log("error", error));
}

module.exports = { createSignature, getSignatures, getSingleSignature };
