const express = require("express");
const hb = require("express-handlebars");
const path = require("path");
// const PORT = 3005;
const {
    createSignature,
    getSignatures,
    getSingleSignature,
    createUser,
    getUserByEmail,
} = require("./signatures");
//const { username, password, database } = require("./credentials.json");

const app = express();
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { compare, hash } = require("./password");
const { response } = require("express");

app.use(express.static(path.join(__dirname, "public")));

app.use(
    cookieSession({
        secret: "Anna Karenina", // why do we use the secret
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// body parse
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf());

//csrf
app.use((request, response, next) => {
    response.locals.csrfToken = request.csrfToken();
    next();
});

//clickjacking
app.use((request, response, next) => {
    response.setHeader("x-frame-options", "deny");
    next();
});

// routes:

//register/homepage
app.get("/", (request, response) => {
    console.log("Yello, are you there?");
    console.log("request session", request.session.user_id); //signature_id
    console.log("request session", request.session); //

    if (request.session.user_id) {
        response.redirect("login");
        return;
    }
    response.render("registration", {
        title: "Registration",
        style: "style.css",
    });
    return;
});

app.post("/registration", (request, response) => {
    const { first, last, email, password } = request.body;
    const error = "Something went wrong, please fill all the fields";

    if (!first || !last || !email || !password) {
        response.render("registration", {
            title: "Registration",
            style: "style.css",
            error,
        });
        return;
    }

    hash(request.body.password) //password
        .then((password_hash) => {
            return createUser({
                first: `${first}`,
                last: `${last}`,
                email: `${email}`,
                password_hash,
            });
        })
        .then((id) => {
            // log in just registered user
            request.session.user_id = id;
            response.render("canvasPage", {
                title: "Your Signature",
                style: "style.css",
            });
            return;
        })
        .catch((error) => {
            console.log(error);
            if (error) {
                response.render("registration", {
                    title: "Registration",
                    style: "style.css",
                    error: "ERROR, relation users does not exist",
                });
                return;
            }
            console.log("error user", error);
            response.sendStatus(500);
        });
});

//login
app.get("/login", (request, response) => {
    response.render("login", {
        title: "Login",
        style: "style.css",
    });
});

app.post("/login", (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    if (!email || !password) {
        response.render("login", {
            error: "Something went wrond, try again, please!",
        });
        return;
    } else {
        getUserByEmail(email)
            .then((user) => {
                if (!user) {
                    response.render("login", {
                        title: "Login",
                        style: "style.css",
                        error:
                            "No users are found with this email. Please try again!",
                    });
                    return;
                }
                compare(password, user.password_hash).then((match) => {
                    if (!match) {
                        response.render("login", {
                            title: "Login",
                            style: "style.css",
                            error:
                                " 2: No users are found with this email. Please try again!",
                        });
                        return;
                    }
                    request.session.user_id = user.id;
                    response.redirect("signed");
                    return;
                });
            })
            .catch((error) => {
                response.render("login", {
                    error: "Something went wrong",
                });
            });
    }
});

app.post("/canvasPage", (request, response) => {
    const { signature } = request.body; // worauf sich das signature bezieht?
    const user_id = request.session.user_id;
    console.log("userID", user_id);

    if (!signature) {
        const error = "Please sign here";
        response.render("canvasPage", {
            title: "Your Signature",
            style: "style.css",
            error,
        });
        return;
    } else {
        createSignature({ user_id, signature })
            .then(() => {
                response.redirect("/signed");
            })
            .catch((error) => {
                console.log(error);
                response.render("canvasPage", {
                    error: "Something went wrong!",
                });
            });
    }
});

app.get("/signed", (request, response) => {
    console.log("I signed, leave me alone");
    const user_id = request.session.user_id;
    console.log("USERID", user_id);

    if (user_id) {
        getSingleSignature(user_id).then((signature) => {
            console.log("SIGNATURE", signature);

            response.render("signed", {
                title: "Thank you!",
                style: "style.css",
                signature,
            });
        });
    } else {
        response.redirect("/"); // it was petition, then registrations
        return;
    }
});

app.get("/signatures", (request, response) => {
    console.log("List of sinners");

    getSignatures()
        .then((signatures) => {
            response.render("signaturesList", {
                title: "Supporters",
                style: "style.css",
                signatures,
            });
        })
        .catch((error) => {
            console.log("error", error);
            response.sendStatus(500); // 404?
        });
});

app.listen(process.env.PORT || 3005);
