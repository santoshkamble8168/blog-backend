exports.getTime = (days = 1) => { //default 1day
    return (new Date(Date.now() + 1000 * 60 * 60 * 24)) * days
}

exports.getCurrentTime = () => {
  return new Date(Date.now());
};

exports.getReadTime = (content) => {
  if (content) {
    //currently words handle we also need to findout the image and video watch time
    const words = getWordsCount(content);
    const readTime = Math.ceil((words / 200) * 0.6);
    return `${readTime} min`;
  } else {
    return "0 min";
  }
};

const getWordsCount = function (content) {
  return (content.length && content.split(/\s+\b/).length) || 0;
};