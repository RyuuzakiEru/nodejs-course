const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');


exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successRedirect: '/',
    successFlash: 'Successfully logged in'

} );

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged out');
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    if( req.isAuthenticated()) {
        next();
    }else{
        req.flash('error', 'You must Log In');
        res.redirect('/');
    }
};

exports.forgot = async (req, res) => {
    const user = await User.findOne({ email: req.body.email} );
    if (!user) {
        req.flash('success', 'A password reset mail has been sent to you');
        return res.redirect('/login');
    }
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordTokenExpire = Date.now() + 360000 //1 hour
    await user.save();

    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    await mail.send({
        user,
        subject: 'Password reset',
        resetURL,
        filename: 'password-reset'
    });


    req.flash('success', `A password reset mail has been sent to ${user.email}`);
    res.redirect('/login');
};

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordTokenExpire: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Invalid or expired token');
        return res.redirect('/login');
    }
    res.render('reset', {title: 'Reset Password'});
};

exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body['confirm-password']){
        next();
        return;
    } 
    req.flash('error', 'Passwords do not match');
    res.redirect('back');

};

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordTokenExpire: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'An error has ocurred');
        return res.redirect('/login');
    };

    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', 'Password updated successfully');
    res.redirect('/');
};