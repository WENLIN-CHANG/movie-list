const movieModel = require('../models/movieModel')
const { validateAndSanitizeSearch, validateMovieId } = require('../middleware/validation')

const BASE_IMG_URL = 'https://movie-list.alphacamp.io/posters/'

const movieController = {
  // 取得電影列表（包含搜尋功能）
  getMovies: (req, res) => {
    try {
      const keyword = validateAndSanitizeSearch(req.query.search)
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      
      // 驗證分頁參數
      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).render('error', {
          status: 400,
          title: '錯誤請求',
          message: '無效的分頁參數'
        })
      }
      
      const result = movieModel.searchMovies(keyword, page, limit)
      
      // 如果是AJAX請求，返回JSON
      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.json({
          ...result,
          keyword,
          BASE_IMG_URL
        })
      }
      
      // 否則渲染頁面
      res.render('index', { 
        movies: result.movies,
        pagination: result.pagination,
        BASE_IMG_URL, 
        keyword
      })
    } catch (error) {
      console.error('取得電影列表時發生錯誤:', error)
      
      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.status(500).json({
          error: '無法載入電影列表'
        })
      }
      
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