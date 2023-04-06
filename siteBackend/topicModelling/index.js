const lda = require("lda");
const arraySort = require('array-sort');

const LDAModelling = (reviewsRatings) => {
  let len = reviewsRatings.length;

  const hMap = {};
  const finalMap = [];

  for (let i = 0 ; i < len ; i++) {
    const text = reviewsRatings[i].review;
    const textLength = text.length;

    const documents = text.match( /[^\.!\?]+[\.!\?]+/g ); //extracting sentences

    const result = lda(documents , 2 , 5);

    for (let j = 0 ; j < result.length ; j++) {
        for (let k = 0 ; k < result[j].length ; k++) {
            const term = result[j][k].term;
            const prob = result[j][k].probability;
            const newWeight = prob;

            if (term in hMap) {
                hMap[term] += newWeight;
            } else {
                hMap[term] = newWeight;
            }
        }
    }
  }

  let termsHmap = Object.keys(hMap).map((key) => {
    return {text: key , value: hMap[key]}
  })

  termsHmap.sort((a , b) => {
    return b.value - a.value;
  })

  if (termsHmap.length > 50) termsHmap.slice(0 , 50);

  return termsHmap;
};

module.exports = LDAModelling;