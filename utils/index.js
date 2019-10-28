function flashAndRedirect(req, res, flashStatus, flashMsg, url) {
  req.flash(flashStatus, flashMsg);
  res.redirect(url);
}

module.exports = {
  flashAndRedirect: flashAndRedirect
};
