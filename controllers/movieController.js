const movieModel = require('../models/movieModel')
const { validateAndSanitizeSearch, validateMovieId } = require('../middleware/validation')
const { EXTERNAL, PAGINATION, ERROR_MESSAGES, HTTP_STATUS } = require('../config/constants')
const { sendErrorResponse, isAjaxRequest, sendJsonResponse, sendPageResponse } = require('../utils/responseUtils')

const movieController = {
  // 取得電影列表（包含搜尋功能）
  getMovies: async (req, res) => {
    try {
      const keyword = validateAndSanitizeSearch(req.query.search)
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT
      
      // 驗證分頁參數
      if (page < 1 || limit < 1 || limit > PAGINATION.MAX_LIMIT) {
        return sendErrorResponse(
          res, 
          HTTP_STATUS.BAD_REQUEST, 
          '錯誤請求', 
          ERROR_MESSAGES.INVALID_PAGINATION,
          isAjaxRequest(req)
        )
      }
      
      const result = await movieModel.searchMovies(keyword, page, limit)
      
      // 如果是AJAX請求，返回JSON
      if (isAjaxRequest(req)) {
        return sendJsonResponse(res, {
          ...result,
          keyword,
          BASE_IMG_URL: EXTERNAL.BASE_IMG_URL
        })
      }
      
      // 否則渲染頁面
      return sendPageResponse(res, 'index', { 
        movies: result.movies,
        pagination: result.pagination,
        BASE_IMG_URL: EXTERNAL.BASE_IMG_URL, 
        keyword
      })
    } catch (error) {
      console.error('取得電影列表時發生錯誤:', error)
      
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        '伺服器錯誤',
        ERROR_MESSAGES.LOAD_MOVIES_ERROR,
        isAjaxRequest(req)
      )
    }
  },

  // 取得電影詳情
  getMovieDetail: async (req, res) => {
    try {
      const id = req.params.id
      
      // 驗證ID
      const validationError = validateMovieId(id)
      if (validationError) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          '錯誤請求',
          validationError
        )
      }
      
      const movie = await movieModel.getMovieById(id)
      
      // 如果找不到電影
      if (!movie) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          '找不到頁面',
          ERROR_MESSAGES.MOVIE_NOT_FOUND
        )
      }
      
      return sendPageResponse(res, 'detail', { 
        movie, 
        BASE_IMG_URL: EXTERNAL.BASE_IMG_URL 
      })
    } catch (error) {
      console.error('取得電影詳情時發生錯誤:', error)
      
      return sendErrorResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        '伺服器錯誤',
        ERROR_MESSAGES.LOAD_DETAIL_ERROR
      )
    }
  }
}

module.exports = movieController