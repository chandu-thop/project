const Listing=require("../models/listing")
const Review=require("../models/review");   



module.exports.createReview=async (req,res)=>{
        let listing=await Listing.findById(req.params.id);
        let newReview= new Review(req.body.review);
        newReview.author=req.user._id;
         console.log("New Review:", newReview);
    console.log("Logged in User:", req.user);
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        req.flash("success","New Review Created!"); 
        

        // res.redirect(`/listings/${listing._id}`);
        res.redirect("/listings");

    };
module.exports.deleteReview=async(req,res)=>{
        let{id, reviewId}=req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success","Listing Deleted!"); 
        res.redirect(`/listings/${id}`);
    };