const { Schema, model } = require("mongoose");

const reviewsRatingsSchema = new Schema({
  rating: Number,
  review: String,
  site: {
    type: String,
    required: [true, "Review Site is required"],
    enum: ["Amazon", "Flipkart", "MouthShut"],
  },
});

const productReviewSchema = new Schema({
  productName: {
    type: String,
    required: [true, "Product Name is Mandatory"],
  },
  reviewsRatings: [reviewsRatingsSchema],
  isProcessed: {
    type: Boolean,
    required: [true, "isProcessed attribute is required"],
    default: () => {
      return false;
    },
  },
  lastModified: {
    type: Date,
    required: [true],
  },
  sentiment: {
    type: String,
    enum: ["Positive", "Negative", "Neutral"],
  },
  averageRating: Number,
  keywords: [
    {
      text: String,
      value: Number,
    },
  ],
  significantReviews: [
    {
      site: String,
      review: String,
      rating: Number,
    },
  ],
});

module.exports = model("Product", productReviewSchema);
