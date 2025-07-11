const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocoding = mbxGeocoding({ accessToken: mapToken });

const { cloudinary } = require("../cloudConfig.js");

// Show all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// Render form to create new listing
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Create new listing
module.exports.createListing = async (req, res) => {
    let response = await geocoding
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    const features = response.body.features;

    if (!features || features.length === 0) {
        req.flash("error", "Location not found. Please enter a valid location.");
        return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);

    // ✅ Save image from Cloudinary
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    newListing.owner = req.user._id;
    newListing.geometry = features[0].geometry;

    const savedListing = await newListing.save();
    console.log("Saved listing with geometry:", savedListing.geometry);

    req.flash("success", "New Listing Created!");
    // res.redirect(`/listings/${newListing._id}`);
    res.redirect("/listings");
};

// Show single listing
module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author", model: "User" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    listing.formattedPrice = listing.price.toLocaleString("en-IN");

    // ✅ Pass MAP_TOKEN from env
    res.render("listings/show.ejs", {
        listing,
        currUser: req.user,
        MAP_TOKEN: process.env.MAP_TOKEN
    });
};

// Render edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update listing
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });

    // ✅ Replace image if new one is uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${listing._id}`);
};

// Delete listing
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};


