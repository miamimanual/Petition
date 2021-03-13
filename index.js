const express = require("express");
const https = require("https");
const hb = require("express-handlebars");
const path = require("path");
const app = express();
const PORT = 3005;
const { createSignature, getSignatures } = require("./signatures");
const cookieSession = require("cookie-session");

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
        extended: false,
    })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/petition", function (request, response) {
    console.log("Yello, are you there?");
    response.render("homepage", {
        title: "Petition",
        style: "style.css",
    });
    // response.end("OK");
});

app.post("/petition", function (request, response) {
    const { first, last, signature } = request.body;
    console.log("BODY", request.body);

    if (!first || !last) {
        const error = "Something went wrong, please try again";
    } else {
        createSignature(request.body)
            .then(() => {
                // id ide u zagradu
                //   request.session.signature_id = id;
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
    //response.end("ja sam potpisala");
});

app.get("/petition/signers", function (request, response) {
    console.log("List of sinners");
    // response.end("lista potpisanih sinera");
});

app.listen(PORT);
