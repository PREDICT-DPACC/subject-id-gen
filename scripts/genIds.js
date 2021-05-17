/* eslint-disable prefer-const */
/* eslint-disable no-param-reassign */

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

const generateIds = ({ site, n }) => {
  const siteId = site.toUpperCase();
  const siteIdAsArray = [siteId.charCodeAt(0), siteId.charCodeAt(1)];
  let generatedIds = [];
  for (let i = 1; i < n + 1; i += 1) {
    let newIdArray = [siteIdAsArray[0], siteIdAsArray[1]];
    const fourNums = i.toString().padStart(4, '0');
    fourNums.split('').forEach(num => {
      newIdArray.push(parseInt(num, 10));
    });
    let checkDigitArray = [];
    newIdArray.forEach((element, index) => {
      checkDigitArray.push(element * (index + 1));
    });
    const checkDigit =
      checkDigitArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue
      ) % 10;
    const newId = `${siteId}${fourNums}${checkDigit}`;
    generatedIds.push(newId);
  }
  shuffleArray(generatedIds);
  const shuffledIdObjects = generatedIds.map((id, index) => ({
    id,
    site: siteId,
    index: index + 1,
    used: false,
  }));
  return shuffledIdObjects;
};

module.exports = generateIds;
