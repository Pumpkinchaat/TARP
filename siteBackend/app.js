const express = require("express");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");

//routers
const productRouter = require("./routes/product");

const app = express();

// error handlers
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/globalErrorController");

// creating middleware
app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // to enable logging
}

//white-listing the localhost:3000
const whitelist = ["http://localhost:3000" , undefined];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

//!removing late limiter for testing purposes
// for preventing DoS
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour",
// });

// app.use("/api", limiter);

// for security
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); // to make sure next middleware gets executed
});

//use /api/v1/...
app.use("/api/v1/product", productRouter);

// if the above routes don't get triggered, we can fire another middleware
// for catching errors
app.all("*", (req, res, next) => {
  //global error handler
  next(new AppError(`cannot find ${req.originalUrl} on this server!`, 404));
});

// error handling middleware
app.use(globalErrorHandler);

// server
module.exports = app;
