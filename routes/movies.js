const express = require('express')
const router = express.Router()
const movieController = require('../controllers/movieController')

// 首頁重定向到電影列表
router.get('/', (_, res) => {
  res.redirect('/movies')
})

// 電影列表頁面（包含搜尋功能）
router.get('/movies', movieController.getMovies)

// 電影詳情頁面
router.get('/movie/:id', movieController.getMovieDetail)

module.exports = router