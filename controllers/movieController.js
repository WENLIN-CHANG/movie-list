const movieModel = require('../models/movieModel')
const { validateAndSanitizeSearch, validateMovieId } = require('../middleware/validation')

const BASE_IMG_URL = 'https://movie-list.alphacamp.io/posters/'

const movieController = {
  // 取得電影列表（包含搜尋功能）
  getMovies: (req, res) => {
    try {
      const keyword = validateAndSanitizeSearch(req.query.search)
      const movies = movieModel.searchMovies(keyword)
      
      res.render('index', { 
        movies, 
        BASE_IMG_URL, 
        keyword 
      })
    } catch (error) {
      console.error('取得電影列表時發生錯誤:', error)
      res.status(500).render('error', {
        status: 500,
        title: '伺服器錯誤',
        message: '無法載入電影列表'
      })
    }
  },

  // 取得電影詳情
  getMovieDetail: (req, res) => {
    try {
      const id = req.params.id
      
      // 驗證ID
      const validationError = validateMovieId(id)
      if (validationError) {
        return res.status(400).render('error', {
          status: 400,
          title: '錯誤請求',
          message: validationError
        })
      }
      
      const movie = movieModel.getMovieById(id)
      
      // 如果找不到電影
      if (!movie) {
        return res.status(404).render('error', {
          status: 404,
          title: '找不到頁面',
          message: '指定的電影不存在'
        })
      }
      
      res.render('detail', { 
        movie, 
        BASE_IMG_URL 
      })
    } catch (error) {
      console.error('取得電影詳情時發生錯誤:', error)
      res.status(500).render('error', {
        status: 500,
        title: '伺服器錯誤',
        message: '無法載入電影詳情'
      })
    }
  }
}

module.exports = movieController