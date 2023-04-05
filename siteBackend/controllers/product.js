const Product = require("../models/review");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const scraper = require("../scraper/index");

// exports.getReviewData = catchAsync(async (req, res, next) => {
//   const { productName } = req.params;
//   if (!productName) return new AppError("Product Name not suppplied", 400);

//   const reviewRatings = await scraper(productName);

//   res.json(reviewRatings);
// });

exports.generateReviewRatingsID = catchAsync(async (req, res, next) => {
  const productName = req.productName;

  const oldProduct = await Product.findOne({ productName });

  if (
    !oldProduct ||
    Date.now() - new Date(oldProduct.lastModified).getTime() >
      30 * 24 * 60 * 60 * 1000
  ) {
    if (oldProduct) {
      await Product.findByIdAndRemove(oldProduct._id);
      //this will delete the previous copy
    }

    const newProduct = new Product({
      productName,
      lastModified: new Date(),
      isProcessed: false,
      reviewsRatings: [],
    });

    await newProduct.save();


    res.status(201).json({
      status: "success",
      document: {
        productReviews: newProduct,
      },
    });

    scraper(newProduct._id);
  } else {
    let len = oldProduct.reviewsRatings.length;
    let ans = "";
    for (let i = 0 ; i < len ; i++) {
      ans += oldProduct.reviewsRatings[i].review;
      ans += " ";
    }
    // console.log(ans);
    return res.status(200).json({
      status: "success",
      document: {
        productReviews: oldProduct,
      },
    });
  }
});

exports.getProductName = catchAsync(async (req, res, next) => {
  const { productName } = req.params;
  if (!productName) return new AppError("Product Name not supplied", 400);

  req.productName = productName.trim();
  next();
});
