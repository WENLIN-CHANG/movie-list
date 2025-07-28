/**
 * 應用程式常數配置
 * @module config/constants
 */

/**
 * 應用程式配置常數
 * @typedef {Object} AppConstants
 */
module.exports = {
  // 伺服器配置
  SERVER: {
    DEFAULT_PORT: 3000,
    REQUEST_TIMEOUT: 30000 // 30秒
  },

  // 分頁配置
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MAX_PAGES_DISPLAY: 5
  },

  // 快取配置
  CACHE: {
    SEARCH_TIMEOUT: 5 * 60 * 1000, // 5分鐘
    MAX_CACHE_SIZE: 1000
  },

  // 驗證配置
  VALIDATION: {
    MAX_SEARCH_LENGTH: 100,
    MIN_MOVIE_ID: 1
  },

  // 外部資源
  EXTERNAL: {
    BASE_IMG_URL: 'https://movie-list.alphacamp.io/posters/',
    MOVIE_DATA_PATH: '../public/jsons/movies.json'
  },

  // 錯誤訊息
  ERROR_MESSAGES: {
    INVALID_MOVIE_ID: '電影ID不能為空',
    INVALID_ID_FORMAT: '無效的電影ID格式',
    INVALID_ID_RANGE: '電影ID必須為正整數',
    INVALID_PAGINATION: '無效的分頁參數',
    MOVIE_NOT_FOUND: '指定的電影不存在',
    LOAD_MOVIES_ERROR: '無法載入電影列表',
    LOAD_DETAIL_ERROR: '無法載入電影詳情',
    PAGE_NOT_FOUND: '您訪問的頁面不存在',
    SERVER_ERROR: '伺服器發生內部錯誤，請稍後再試'
  },

  // HTTP狀態碼
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
}