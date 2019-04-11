const mongoose = require('mongoose');
const Review = mongoose.model('Review');
const User = mongoose.model('User');

exports.addReview = async (req, res) => {
    req.body.author = req.user._id;
    req.body.store = req.params.id;
    const review = new Review (req.body);
    await review.save();    
    res.redirect('back');

    
};