exports.getTime = (days = 1) => { //default 1day
    return (new Date(Date.now() + 1000 * 60 * 60 * 24)) * days
}

exports.getCurrentTime = () => {
  return new Date(Date.now());
};