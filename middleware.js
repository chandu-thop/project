const Listing=require("./models/listing");
const Review=require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner=async (req,res,next)=>{
      let {id}=req.params;
        let listing=await Listing.findById(id);
        if(!listing.owner.equals(res.locals.currUser._id)){
            req.flash("error","You are not Owner of this account!");
           return res.redirect(`/listings/${id}`);
        } 
        next();
}
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        return next(new ExpressError(errMsg, 400));  
    } else {
        next();
    }
};
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        next(new ExpressError(errMsg, 400)); 
    } else {
        next();
    }
};
module.exports.isReviewAuthor=async (req,res,next)=>{
      let {id,reviewId}=req.params;
        let review=await Review.findById(reviewId);
        if(!review.author.equals(res.locals.currUser._id)){
            req.flash("error","You are not Author of this review!");
           return res.redirect(`/listings/${id}`);
        }
        next();
}