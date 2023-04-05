/**
 *
 * This will return all the significant reviews
 * A review is significant if its length is atleast
 * as much as the average length of all reviews
 */

exports.getSignificantReviews = (reviewsRatings) => {
  let averageLength = 0;

  for (let reviewItem of reviewsRatings) {
    averageLength += reviewItem.review.length;
  }

  averageLength /= reviewsRatings.length;

  const significantReviews = [];

  for (let reviewItem of reviewsRatings) {
    if (reviewItem.review.length >= 1.5 * averageLength) {
      significantReviews.push({
        site: reviewItem.site,
        review: reviewItem.review,
        rating: reviewItem.rating,
      });
    }
  }

  return significantReviews;
};
