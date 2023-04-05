const express = require("express");
const router = express.Router();
const {
  getProductName,
  generateReviewRatingsID,
} = require("../controllers/product");

router.route(`/:productName`).get(getProductName, generateReviewRatingsID);

module.exports = router;
