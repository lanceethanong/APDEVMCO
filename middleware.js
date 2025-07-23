exports.checkLoggedIn = (req, res, next) => {
    if(req.session && req.session.user){
        next();
    }
    else{
        res.redirect('/login');
    }
}

exports.bypassLogin = (req, res, next) =>{
    if(req.session && req.session.user){
        if(req.session.user.role === 'Lab Technician')
            res.redirect(`/dashboard/technician?username=${encodeURIComponent(req.session.user.username)}`);
        else if(req.session.user.role === 'Student')
            res.redirect(`/dashboard/student?username=${encodeURIComponent(req.session.user.username)}`);
    }
    else{
        next();
    }
}

exports.checkLabTech = (req, res, next) => {
    if(req.session && req.session.user && req.session.user.role === 'Lab Technician'){
        next();
    }
    else{
        res.redirect('/login');
    }
}

exports.checkStudent = (req, res, next) => {
    if(req.session && req.session.user && req.session.user.role === 'Student'){
        next();
    }
    else{
        res.redirect('/login');
    }
}