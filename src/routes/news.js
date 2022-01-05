const express = require('express');
const router = express.Router();

const newsController = require('../app/controllers/NewsController');

router.get('/thoi-gia-kit-xet-nghiem', newsController.news1);
router.get('/di-ghe-bao-hanh-be-gai-8-tuoi', newsController.news2);
router.get('/', newsController.index);

module.exports = router;