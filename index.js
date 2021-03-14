const express = require("express");
const hb = require("express-handlebars");
const path = require("path");
const PORT = 3005;
const { createSignature, getSignatures } = require("./signatures");
const cookieSession = require("cookie-session");
const { username, password, database } = require("./credentials.json");
console.log("CREDENTIALS", username, password, database);

const app = express();
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

/*
app.use(
    cookieSession({
        secret: "Anna Karenina",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
*/

// body parse
app.use(
    express.urlencoded({
        extended: false, // i tried out with true
    })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/petition", function (request, response) {
    console.log("Yello, are you there?");
    response.render("homepage", {
        title: "Petition",
        style: "style.css",
    });
});

app.post("/petition", function (request, response) {
    const { first, last, signature } = request.body;
    //console.log("BODY", request.body);
    //console.log("FIRST_LAST", first, last);
    //const bodyObject = JSON.parse(JSON.stringify(request.body));
    //console.log("BODYOBJECT", bodyObject);

    if (!first || !last) {
        const error = "Something went wrong, please try again";
        response.render("homepage", {
            error,
        });
        return; // soll hier?
    } else {
        createSignature({
            first: `${first}`,
            last: `${last}`,
            signature: "test",
        }) // i tried also without {}
            .then(() => {
                // id ide u zagradu
                //   request.session.signature_id = id or result (onda result ide gore u zagradu);
                //
                response.redirect("/petition/signed");
            })
            .catch((error) => {
                console.log("error", error);
            });
        response.redirect("/petition/signed");
    }
});

app.get("/petition/signed", function (request, response) {
    console.log("I signed, leave me alone");
    response.render("signed", {
        title: "Thank you!",
        style: "style.css",
    });
});

app.get("/petition/signatures", function (request, response) {
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

app.listen(PORT);
