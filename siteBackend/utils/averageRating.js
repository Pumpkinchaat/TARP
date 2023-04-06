/**
 *
 * This function will calculate the weighted
 * average rating of all the reviews scraped
 */

exports.getAverageRating = (reviewsRatings) => {
  let total = 0;
  let ratingsTot = 0;

  if (!reviewsRatings.length) return ratingsTot;

  for (let reviewItem of reviewsRatings) {
    if (reviewItem && reviewItem.rating) {
      total += reviewItem.review.length;
      ratingsTot += (reviewItem.rating / 5) * reviewItem.review.length;
    }
  }

  const avgRating = ratingsTot / total;
  return avgRating * 5;
};
