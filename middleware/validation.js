/**
 * 輸入驗證中間件
 * @module middleware/validation
 */

const { VALIDATION, ERROR_MESSAGES } = require('../config/constants')

/**
 * 驗證和清理搜尋參數
 * 移除危險字符，限制長度，防止XSS攻擊
 * @param {string|undefined} searchParam - 原始搜尋參數
 * @returns {string|null} 清理後的搜尋關鍵字，若無效則返回null
 */
const validateAndSanitizeSearch = (searchParam) => {
  if (!searchParam) {
    return null
  }

  let keyword = searchParam.trim()
  
  // 限制搜尋關鍵字長度，防止惡意長字串
  if (keyword.length > VALIDATION.MAX_SEARCH_LENGTH) {
    keyword = keyword.substring(0, VALIDATION.MAX_SEARCH_LENGTH)
  }
  
  // 移除危險字符，只保留字母、數字、空格和基本標點
  keyword = keyword.replace(/[^\w\s\u4e00-\u9fff.-]/g, '')
  
  // 如果清理後為空，設為null
  return keyword || null
}

/**
 * 驗證電影ID
 * 檢查ID是否為有效的正整數
 * @param {string|number|undefined} id - 電影ID
 * @returns {string|null} 錯誤訊息，若驗證通過則返回null
 */
const validateMovieId = (id) => {
  if (!id) {
    return ERROR_MESSAGES.INVALID_MOVIE_ID
  }
  
  if (isNaN(id)) {
    return ERROR_MESSAGES.INVALID_ID_FORMAT
  }
  
  const numId = parseInt(id)
  if (numId < VALIDATION.MIN_MOVIE_ID) {
    return ERROR_MESSAGES.INVALID_ID_RANGE
  }
  
  return null // 無錯誤
}

module.exports = {
  validateAndSanitizeSearch,
  validateMovieId
}