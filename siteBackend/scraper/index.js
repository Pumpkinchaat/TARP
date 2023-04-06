const LDAModelling = require("../topicModelling/index");
//TODO: sites to scrape
//amazon / flipkart / mouthshut
const AppError = require("../utils/appError");

//all the search query strings
const SEARCHQUERY = "https://www.bing.com/search?q=";

//getting the schema / model
const Product = require("../models/review");

//This is a sleep function, which will halt the execution
//thread for x miliseconds
const sleep = async (miliseconds) => {
  return new Promise((res, rej) => {
    setTimeout(res, miliseconds);
  });
};

//This will hold the execution thread using sleep() for 2 to 5 (random) miliseconds
const waitRandomTime = async () => {
  const miliseconds = Math.trunc(Math.random() * (5 - 2) * 1000 + 2000); //generates a random number between 3 to 7
  await sleep(miliseconds);
};

const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { getAverageRating } = require("../utils/averageRating");
const { getSignificantReviews } = require("../utils/significantReview");

//* This will scrape minimum of 10 pages worth of reviews from amazon

const amazonReviewScraper = async (reviewsRatings, productName, page) => {
  try {
    //   console.log("[TEST] here bro 11");
    await waitRandomTime();

    await page.goto(
      `${SEARCHQUERY}${productName
        .split(" ")
        .join("+")}+customer+reviews+amazon`
    );

    await waitRandomTime();

    let html = await page.content();
    let $ = cheerio.load(html);

    const reviewPageUrl = $(
      $(`ol#b_results li.b_algo div.b_title h2 > a`)[0]
    ).attr("href");
    //   console.log("fireeeeeeee********************** ", reviewPageUrl);

    let counter = 0;

    //   const reviewsRatings = []; //! delete this line in production

    while (counter < 1) {
      try {
        await page.goto(`${reviewPageUrl}?pageNumber=${counter + 1}`);
        await waitRandomTime();
        html = await page.content();
        $ = cheerio.load(html);

        const reviewList = $(`div[data-hook="review"]`);
        const listLen = reviewList.length;

        if (!listLen) break;

        for (let i = 0; i < listLen; i++) {
          const reviewItem = $(reviewList[i]);
          const rating = Number(
            $(reviewItem)
              .find('i[data-hook="review-star-rating"] span')
              .text()
              .trim()
              .split(" ")[0]
          );
          const reviewText = $(reviewItem)
            .find(`.review-data span[data-hook="review-body"] span`)
            .text()
            .trim();

          reviewsRatings.push({
            rating,
            review: reviewText,
            site: "Amazon",
          });
        }

        counter++;
      } catch (err) {
        return new AppError("err.message", 500);
      }
    }

    console.log("[INFO] Amazon scraping COMPLETED");
  } catch (err) {
    console.log("[INFO] Not able to scrape AMAZON");
  }
};

//* This will scrape 10 pages worth reviews for flipkart

const flipkartReviewScraper = async (reviewsRatings, productName, page) => {
  try {
    await waitRandomTime();

    //*button: div.col.JOpGWq > a

    await page.goto(
      `${SEARCHQUERY}${productName
        .split(" ")
        .join("+")}+customer+reviews+flipkart`
    );
    await waitRandomTime();

    let html = await page.content();
    let $ = cheerio.load(html);

    const reviewPageUrl = $(
      $(`ol#b_results li.b_algo div.b_title h2 > a`)[0]
    ).attr("href");

    await page.goto(reviewPageUrl);
    await waitRandomTime();

    html = await page.content();
    $ = cheerio.load(html);

    const reviewSearchUrl = `https://flipkart.com${$("div.col.JOpGWq > a").attr(
      "href"
    )}&page=`;

    let counter = 0;

    while (counter < 1) {
      try {
        await page.goto(`${reviewSearchUrl}${counter + 1}`);
        await waitRandomTime();
        html = await page.content();
        $ = cheerio.load(html);

        //rating link: ._1AtVbE div.row div._3LWZlK
        //review link: ._1AtVbE div.row div.t-ZTKy > div

        const reviewList = $(`.col._2wzgFH`);
        const listLen = reviewList.length;

        if (!listLen) break;

        for (let i = 1; i < listLen; i++) {
          const reviewItem = $(reviewList[i]);
          const rating = Number(
            $(reviewItem).find("div._3LWZlK").text().trim()
          );
          const reviewText = $(reviewItem)
            .find("div.t-ZTKy > div")
            .text()
            .trim();

          if (rating && reviewText) {
            reviewsRatings.push({
              rating,
              review: reviewText,
              site: "Flipkart",
            });
          }
        }

        counter++;
      } catch (err) {
        return new AppError(err.message, 500);
      }
    }

    console.log("[INFO] Flipkart scraping COMPLETED");
  } catch (err) {
    console.log("[INFO] Not able to scrape FLIPKART");
  }
};

//*This will scrape 10 pages worth reviews from mouth shut

const mouthShutScraper = async (reviewsRatings, productName, page) => {
  try {
    await waitRandomTime();

    await page.goto(
      `${SEARCHQUERY}${productName.split(" ").join("+")}+reviews+mouthShut`
    );

    await waitRandomTime();

    let html = await page.content();
    let $ = cheerio.load(html);

    const reviewPageUrl = $(
      $(`ol#b_results li.b_algo div.b_title h2 > a`)[0]
    ).attr("href");

    let counter = 0;

    while (counter < 1) {
      await page.goto(`${reviewPageUrl}-page-${counter + 1}`);
      await waitRandomTime();
      html = await page.content();
      $ = cheerio.load(html);

      const reviewList = $(`div.row.review-article .row > div:nth-child(2)`);
      const listLen = reviewList.length;

      if (!listLen) break;

      for (let i = 0; i < listLen; i++) {
        const reviewItem = $(reviewList[i]);
        const rating = $(reviewItem).find(`.rating span .rated-star`).length;
        const reviewText = $(reviewItem)
          .find(`.more.reviewdata p`)
          .text()
          .trim();

        reviewsRatings.push({
          rating,
          review: reviewText,
          site: "MouthShut",
        });
      }

      //reviewList URL: div.row.review-article .row > div:nth-child(2)
      //rating: div.row.review-article .row > div:nth-child(2) .rating span .rated-star
      //reviewText: div.row.review-article .row > div:nth-child(2) .more.reviewdata p
      counter++;
    }

    console.log("[INFO] MouthShut scraping COMPLETED");
  } catch (err) {
    console.log("[INFO Not able to scrape reviews from MOUTHSHUT");
  }
};

const main = async (id) => {
  const product = await Product.findById(id);
  const productName = product.productName;

  console.log("[INFO] Initializing the scraping process");

  const browser = await puppeteer.launch({
    headless: true, //!change this is production (correct value: true)
    args: [`--window-size=1920,1080`],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const reviewsRatings = [];

  const pageAmazon = await browser.newPage();
  const pageFlipkart = await browser.newPage();
  const pagemouthShut = await browser.newPage();

  //   const productName = "Iphone 14 Pro Max";

  await Promise.all([
    amazonReviewScraper(reviewsRatings, productName, pageAmazon),
    flipkartReviewScraper(reviewsRatings, productName, pageFlipkart),
    mouthShutScraper(reviewsRatings, productName, pagemouthShut),
  ]);

  await browser.close();

  // console.log(
  //   getAverageRating(reviewsRatings),
  //   " ******** This is average rating"
  // );

  const averageRating = getAverageRating(reviewsRatings);
  const significantReviews = getSignificantReviews(reviewsRatings);
  let sentiment;

  const keywords = LDAModelling(reviewsRatings);

  if (averageRating < 2) sentiment = "Negative";
  else if (averageRating < 3) sentiment = "Neutral";
  else sentiment = "Positive";

  product.lastModified = new Date();
  product.reviewsRatings = reviewsRatings;
  product.isProcessed = true;
  product.sentiment = sentiment;
  product.averageRating = averageRating;
  product.significantReviews = significantReviews;
  product.keywords = keywords;

  await product.save();
  console.log("[INFO] Product ID: " + id + " has been successfully updated");
};

module.exports = main;
