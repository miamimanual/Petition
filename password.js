const { genSalt, hash, compare } = require("bcryptjs");

module.exports = {
    compare,
    hash: (password) => {
        return genSalt().then((salt) => {
            return hash(password, salt);
        });
    },
};

/*
function hash(password) {
    return genSalt().then((salt) => {
        return bcryptHash(password, salt);
    });
}
    }*/
