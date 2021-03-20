const spicedPg = require("spiced-pg");

const database = process.env.DB || "signatures";

function getDatabaseURL() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    const { username, password } = require("./credentials.json");
    return `postgres:${username}:${password}@localhost:5432/${database}`;
}

const db = spicedPg(getDatabaseURL());
console.log(`[db] Connecting to: ${database}`);

function getSignatures() {
    return db
        .query(
            "SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users JOIN signatures ON signatures.user_id = users.id JOIN user_profiles ON user_profiles.user_id = users.id WHERE signature IS NOT NULL;" //AND user_profiles.age IS NULL
        )
        .then((result) => result.rows);
}

function getSignaturesByCity(city) {
    return db
        .query(
            "SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users JOIN signatures ON signatures.user_id = users.id JOIN user_profiles ON user_profiles.user_id = users.id WHERE signature IS NOT NULL AND city = $1;",
            [city]
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

function getUserInfoById(user_id) {
    return db
        .query("SELECT * FROM users WHERE id =$1", [user_id])
        .then((result) => result.rows[0]);
}

function createSignature({ user_id, signature }) {
    return db
        .query(
            "INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id",
            [user_id, signature]
        )
        .then((result) => result.rows[0].id);
}

function getUserByEmail(email) {
    return db
        .query("SELECT * FROM users WHERE email = $1", [email])
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

function createUserProfile({ user_id, age, city, url }) {
    return db
        .query(
            "INSERT INTO user_profiles (user_id, age, city, url) VALUES ($1, $2, $3, $4) RETURNING id",
            [user_id, age ? age : null, city, url]
        )
        .then((result) => result.rows[0]);
}

function updateUser({ first, last, email, password_hash, user_id }) {
    if (password_hash) {
        return db
            .query(
                "UPDATE users SET first = $1, last = $2, email = $3, password_hash = $4 WHERE id = $5",
                [first, last, email, password_hash, user_id]
            )
            .then((result) => {
                console.log(result);
                result.rows[0];
            });
    }
    return db
        .query(
            "UPDATE users SET first = $1, last = $2, email = $3 WHERE id = $4",
            [first, last, email, user_id]
        )
        .then((result) => result.rows[0]);
}

function upsertUserProfile({ user_id, age, city, url }) {
    return db
        .query(
            "INSERT INTO user_profiles (user_id, age, city, url) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $2, city = $3, url = $4 RETURNING id",
            [user_id, age ? age : null, city, url]
        )
        .then((result) => result.rows[0]);
}

function deleteSignature(user_id) {
    return db.query("DELETE signature FROM signatures WHERE user_id =$1", [
        user_id,
    ]);
    // DELETE FROM signatures WHERE userd_id = $1, [user_id]
}

module.exports = {
    createSignature,
    getSignatures,
    getSingleSignature,
    createUser,
    getUserByEmail,
    createUserProfile,
    getSignaturesByCity,
    updateUser,
    upsertUserProfile,
    getUserInfoById,
};
