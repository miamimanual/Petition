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

app.use(
    cookieSession({
        secret: "Anna Karenina",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/petition", function (request, response) {
    console.log("Yello, are you there?");
    response.render("homepage", {
        title: "Petition",
        style: "style.css",
        body: "homepage.handlebars",
    });
    // response.end("OK");
});

app.post("/petition", function (request, response) {
    createSignature(request.body).then((id) => {
        request.session.signature_id = id;
        response.redirect("/petition/signed");
    });
});

app.get("/petition/signed", function (request, response) {
    console.log("I signed, leave me alone");
    //response.end("ja sam potpisala");
});

app.get("/petition/signers", function (request, response) {
    console.log("List of sinners?");
    // response.end("lista potpisanih sinera");
});

app.listen(PORT);
