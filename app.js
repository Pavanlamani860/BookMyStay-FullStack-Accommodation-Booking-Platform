if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");

const express = require("express");
const path = require("path");
const app = express();

const liveReloadServer = livereload.createServer();

liveReloadServer.watch(path.join(__dirname, "public"));
liveReloadServer.watch(path.join(__dirname, "views"));
app.use(connectLiveReload());

const mongoose = require("mongoose");
// const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressErrors = require("./utils/expressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRoutes = require("./routes/bookings");
const aiRoutes = require("./routes/ai");

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodoverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

//connections to mongoDb with help of mongoose
const MONGO_URL = "mongodb://127.0.0.1:27017/bookMystay";
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
app.use("/", bookingRoutes);
app.use("/", aiRoutes);

//Listing related routes
app.use("/listings", listingRouter);
//reviews  routes
app.use("/listings/:id/reviews", reviewRouter);
//signUp routes
app.use("/", userRouter);

//error handlers:
app.use((req, res, next) => {
  next(new ExpressErrors(404, "Page Not Found"));
});

//common error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
