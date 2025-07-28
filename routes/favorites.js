const express = require('express')
const router = express.Router()
const favoriteModel = require('../models/favoriteModel')
const movieModel = require('../models/movieModel')
const logger = require('../config/logger')
const { validateMovieIdMiddleware } = require('../middleware/validation')
const { handleError } = require('../middleware/errorHandler')

// 獲取收藏頁面
router.get('/', async (req, res) => {
  try {
    const favorites = await favoriteModel.getFavorites()
    res.render('favorites', { 
      favorites,
      BASE_IMG_URL: process.env.BASE_IMG_URL || 'https://movie-list.alphacamp.io/posters/'
    })
  } catch (error) {
    logger.error('Error rendering favorites page:', error)
    handleError(error, req, res)
  }
})

// API: 獲取收藏清單
router.get('/api', async (req, res) => {
  try {
    const favorites = await favoriteModel.getFavorites()
    const count = await favoriteModel.getFavoritesCount()
    
    res.json({
      success: true,
      favorites,
      count
    })
  } catch (error) {
    logger.error('Error getting favorites API:', error)
    res.status(500).json({
      success: false,
      message: '獲取收藏清單失敗'
    })
  }
})

// API: 添加收藏
router.post('/api', validateMovieIdMiddleware, async (req, res) => {
  try {
    const { movieId, title, image } = req.body
    
    // 驗證電影是否存在
    const movie = await movieModel.getMovieById(movieId)
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: '電影不存在'
      })
    }

    const result = await favoriteModel.addFavorite({
      id: parseInt(movieId),
      title: title || movie.title,
      image: image || movie.image
    })

    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    logger.error('Error adding favorite:', error)
    res.status(500).json({
      success: false,
      message: '加入收藏失敗'
    })
  }
})

// API: 移除收藏
router.delete('/api/:movieId', validateMovieIdMiddleware, async (req, res) => {
  try {
    const { movieId } = req.params
    const result = await favoriteModel.removeFavorite(movieId)

    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    logger.error('Error removing favorite:', error)
    res.status(500).json({
      success: false,
      message: '移除收藏失敗'
    })
  }
})

// API: 檢查收藏狀態
router.get('/api/check/:movieId', validateMovieIdMiddleware, async (req, res) => {
  try {
    const { movieId } = req.params
    const isFavorite = await favoriteModel.isFavorite(movieId)
    
    res.json({
      success: true,
      isFavorite
    })
  } catch (error) {
    logger.error('Error checking favorite status:', error)
    res.status(500).json({
      success: false,
      message: '檢查收藏狀態失敗'
    })
  }
})

module.exports = router