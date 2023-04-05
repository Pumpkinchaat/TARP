/**
 *
 * This function will calculate the weighted
 * average rating of all the reviews scraped
 */

exports.getAverageRating = (reviewsRatings) => {
  let total = 0;
  let ratingsTot = 0;

  for (let reviewItem of reviewsRatings) {
    total += reviewItem.review.length;
    ratingsTot += (reviewItem.rating / 5) * reviewItem.review.length;
  }

  const avgRating = ratingsTot / total;
  return (avgRating * 5);
};
