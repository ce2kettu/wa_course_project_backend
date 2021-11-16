const express = require('express');
const router = express.Router();

router.get('/status', function (req, res, next) {
  res.json({ message: "ok" });
});

module.exports = router;
