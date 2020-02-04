function adduser (body) {
    conn.query('SELECT * FROM users WHERE username = ? AND api = 2', [body.login], function(err, result)  {
        if (err) res.redirect('/error/SQL error ' + err);
        if (result.length == 0)
        {
            sql = 'INSERT INTO `users` (`username`, `img`, `api`) VALUES ( ?, ?, 2)'
            conn.query(sql, [body.login, body.avatar_url], (err) => { if (err) res.redirect('/error/SQL error ' + err); })
        }
    })
}
console.log("CONNECTION ...")
var headers = {
    'Accept': 'application/json',
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
}
var options = {
    url: 'https://github.com/login/oauth/access_token',
    method: 'POST',
    headers: headers,
    form: {
        'code': req.query.code, 'client_id': 'c75f064c1f2cf2694e0a',
        'client_secret': '760462e2ee593b48a4163de0753d029da2e07bbb'
    }
}

request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var resp = JSON.parse(body)
        var options = {
            url: 'https://api.github.com/user',
            method: 'GET',
            headers: headers,
            qs: { 'access_token': resp.access_token }
        }
        request(options, function (error2, response, body) {
            if (!error && response.statusCode == 200) {
                var body = JSON.parse(body)
                req.session.profile = new Array
                console.log(body)

                req.session.profile.username = body.login;
                req.session.profile.img = body.avatar_url;
                req.session.profile.api = '2';
                req.session.first = '1';
                adduser(body)
                res.redirect('/index')
            }
            else
                res.redirect('/error/request in oauth.js' + response.statusCode + " : " + error)

        })
    }
    else
        res.redirect('/error/request in oauth.js' + response.statusCode + " : " + error2);
})