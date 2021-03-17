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

    hash(request.body.password)
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
            if (error) {
                response.render("registration", {
                    title: "Registration",
                    style: "style.css",
                    error: "This Email is already registered!",
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
    });
});

app.post("/login", (request, response) => {
    getUserByEmail(email).then((user) => {
        if (!user) {
            response.render("login", {
                title: "Login",
                style: "style.css",
                error: "No users are found with this email. Please try again!",
            });
            return;
        }
        compare(request.body.password, user.password_hash)
            .then((match) => {
                if (!match) {
                    response.render("login", {
                        title: "Login",
                        style: "style.css",
                        error:
                            "No users are found with this email. Please try again!",
                    });
                    return;
                }
            })
            .then((id) => {
                // log in just registered user
                request.session.user_id = id;
                response.render("/", {
                    title: "You are logged in",
                    style: "style.css",
                });
                return;
            });
    });
});

app.post("/canvasPage", (request, response) => {
    const { signature } = request.body;
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
    console.log(user_id);

    if (user_id) {
        getSingleSignature(user_id).then((signature) => {
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
