/**
 * 響應工具函數
 * @module utils/responseUtils
 */

const { HTTP_STATUS } = require('../config/constants')

/**
 * 發送錯誤響應
 * 根據請求類型回應JSON或HTML錯誤頁面
 * @param {Object} res - Express response 對象
 * @param {number} status - HTTP 狀態碼
 * @param {string} title - 錯誤標題
 * @param {string} message - 錯誤訊息
 * @param {boolean} [isAjax=false] - 是否為 AJAX 請求
 * @returns {Object} Express響應物件
 */
const sendErrorResponse = (res, status, title, message, isAjax = false) => {
  if (isAjax) {
    return res.status(status).json({
      error: message,
      status,
      title
    })
  }
  
  return res.status(status).render('error', {
    status,
    title,
    message
  })
}

/**
 * 檢查是否為 AJAX 請求
 * @param {Object} req - Express request 對象
 * @returns {boolean}
 */
const isAjaxRequest = (req) => {
  return req.headers['x-requested-with'] === 'XMLHttpRequest'
}

/**
 * 發送成功的 JSON 響應
 * @param {Object} res - Express response 對象
 * @param {Object} data - 響應資料
 * @param {number} status - HTTP 狀態碼（預設 200）
 */
const sendJsonResponse = (res, data, status = HTTP_STATUS.OK) => {
  return res.status(status).json(data)
}

/**
 * 發送成功的頁面響應
 * @param {Object} res - Express response 對象
 * @param {string} template - 模板名稱
 * @param {Object} data - 模板資料
 */
const sendPageResponse = (res, template, data) => {
  return res.render(template, data)
}

module.exports = {
  sendErrorResponse,
  isAjaxRequest,
  sendJsonResponse,
  sendPageResponse
}