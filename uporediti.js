app.post("/login", (request, response) => {
    const email = request.body.email;
    const password = request.body.password;
    if (!email || !password) {
        response.render("login", { error: "need all your credentials" });
        return;
    } else {
        getUserByEmail(email)
            .then((user) => {
                // log die ganzen daten des users aus dem user table:
                console.log(user);
                if (!user) {
                    response.render("login", {
                        error: "no such user",
                    });
                    return;
                }
                compare(password, user.password_hash).then((match) => {
                    if (!match) {
                        response.render("login", {
                            error: "check credentials",
                        });
                        return;
                    }
                    request.session.user_id = user.id;
                    response.redirect("signed");
                    return;
                });
            })
            .catch((error) => {
                console.log(error);
                response.render("login", {
                    error: "something went wrong",
                });
            });
    }
});
