const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const user = require("../models/user.js");
const passport = require("passport");
const Listing = require("../models/listing");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      let newUser = new user({ email, username });
      const registeredUser = await user.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to bookMystay..");
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  }),
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to BookMystay! You are now logged in!..");
    res.redirect("/listings");
  },
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
});

// My Profile
router.get("/profile", (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  res.render("users/profile");
});

// My Listings
router.get("/profile/listings", async (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  const listings = await Listing.find({
    owner: req.user._id,
  });

  res.render("users/listings", { listings });
});

// Edit Profile
router.get("/profile/edit", (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  res.render("users/edit");
});

//passwrd Changing
router.get("/profile/password", (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  res.render("users/passwordChange");
});

router.post("/profile/password", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Password Match Check
    if (newPassword !== confirmPassword) {
      req.flash("error", "Passwords do not match");

      return res.redirect("/profile/password");
    }

    const user = req.user;
    await user.changePassword(currentPassword, newPassword);

    req.flash("success", "Password updated successfully");

    res.redirect("/profile");
  } catch (err) {
    req.flash("error", err.message);

    res.redirect("/profile/password");
  }
});

module.exports = router;
