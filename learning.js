const { response } = require("express");
function checkLogin(email, password) {
    const user = null;
    user = getUserByEmail(email); // make the query from database
    if (!user) {
        return false;
    }
    if (user.password !== password) {
        return false;
    }
    return user;
}
app.post("/login", (request, response) => {
    const user = checkLogin(request.body.email, request.body.password);
    if (!user) {
        response.render("login", {
            error: "No user found",
        });
        return;
    }
    request.session.user_id = user.id;
    response.redirect("/");
});
