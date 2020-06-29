module.exports = function() {
  this.cacheable();
  const callback = this.async();
  callback(null, "console.log('ok');");
};
