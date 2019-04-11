const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const reviewSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'Author needed'
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: ' Store needed'
    },
    text: {
        type: String,
        required: 'Please enter review'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }


});

function autopopulate(next) {
    this.populate('author');
    next();
};

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

reviewSchema.pre('aggregate', autopopulate);
module.exports = mongoose.model('Review', reviewSchema);