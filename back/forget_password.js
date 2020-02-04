email = eschtml(req.body.email);
console.log(email);
console.log("okok");
sql = "SELECT * FROM users WHERE email = ?";
conn.query(sql,[email],function(error,result){
    if (error) throw error
    if (result.length > 0)
    {
        let smtpTransport = mailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'matchacolin@gmail.com',
                pass: 'Matcha1234'
            }
        });
        newpass = rand.generate(10)
        mail = 
        {
            from: "matchacolin@gmail.com", to: email, subject: "Forget Password",
            html: '<html><body><div> align=center> \
            YOUR LOGIN : <BR />\
            '+result[0].username+'<BR /><BR />\
            YOUR NEW PASSWORD : <BR />\
            '+newpass+'<BR />\
            </div></body></html>'
        }
        smtpTransport.sendMail(mail, function(error, response){
            if (error){
                res.render('pages/login',{req: req})
            }
            else {
                bcrypt.hash(newpass, 10, function(err, hash){
                    if (err) throw err
                    sql = "UPDATE users SET password = ? WHERE email = ?"
                    conn.query(sql, [hash, email],function(error, result){
                        if (error) throw error}) })
                        var msg = "Your new password has sent to your email"
                        res.render('pages/login',{success: msg})
            }
            smtpTransport.close()})
        }
        else{
            res.render('pages/forget_password',{error: "This email doesn't exist"})
        }   
})