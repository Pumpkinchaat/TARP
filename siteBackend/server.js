//loading the environment variables for development environemnt
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({path: `${__dirname}/.env`});
}

const mongoose = require("mongoose");

// global synchronous error handler
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log(err); //remove this in production //!DANGER
  console.log("unhandled EXCEPTION 💥 shutting down");
  process.exit(1);
});

let connectionURL;
if (process.env.NODE_ENV === "development") {
  connectionURL = process.env.LOCAL_DB_CONNECTION;
} else {
  connectionURL = process.env.DATABASE;
}

mongoose
  .connect(connectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("db connection successful");
  })
  .catch((err) => console.log("ERROR 💥", err.message));

const app = require("./app");

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`[INFO] running at port ${port}`);
});

// global unhandledRejection catcher (async code exception handler)
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }
  
  console.log("unhandled REJECTION 💥 shutting down");
  server.close(() => {
    process.exit(1);
  });
});
