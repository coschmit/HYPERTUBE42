
function adduser (body) {
    conn.query('SELECT * FROM users WHERE username = ? AND api = 3', [body.login], (err, result) => {
        if (err) res.redirect('/error/SQL error ' + err);
        if (result.length == 0)
        {
            sql = 'INSERT INTO `users` (`username`, `firstname`, `name`, `email`, `img`, `api`) VALUES ( ?, ?, ?, ?, ?, 3)'
            conn.query(sql, [body.login, body.first_name, body.last_name, body.email, body.image_url], (err) => { if (err) res.redirect('/error/SQL error ' + err); })
        }
    })
}

request.post({
    url: 'https://api.intra.42.fr/oauth/token',
    json: true,
    body: {
        code: req.query.code,
        grant_type: 'authorization_code',
        client_id: '80798f26545489ef220b2a45524d607b0c920a174d5dff5398d18c8a25e416bf',
        client_secret: '2fa0a25a1b09d3e756ef3820fdc0368e97af67b0aaef581debda307f1d5c1fc8',
        redirect_uri: 'http://localhost:8888/oauth42'
    }
}, function(error, response, body){

    if (error)
        console.log("error1");
    else if (response.body.error || response.statusCode != 200) 
    console.log("error2");
    else
    {
        token = response.body.access_token;
        request.get({
            url: 'https://api.intra.42.fr/v2/me?access_token=' + token,
            json: true
        }, (error, response, body) => {
            if (error)
                res.redirect('error/ oauth42 request error ' + response.statusCode + " : " + error);
            else if (response.body.error || response.statusCode != 200)
                res.redirect('error/ oauth42 request error ' + response.statusCode + " : " + response.body.error);
            else
            {
                adduser(body)
                req.session.profile = new Array;
                req.session.profile.username = body.login
                req.session.profile.firstname = body.first_name
                req.session.profile.name = body.last_name
                req.session.profile.email = body.email
                req.session.profile.img = body.image_url
                req.session.profile.api = '3';
                req.session.first = '1';
                res.redirect('/index')
            }
        })
    } 
});