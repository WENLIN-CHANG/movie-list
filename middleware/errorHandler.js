const { ERROR_MESSAGES, HTTP_STATUS } = require('../config/constants')

// 404錯誤處理中間件
const notFoundHandler = (_, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).render('error', {
    status: HTTP_STATUS.NOT_FOUND,
    title: '找不到頁面',
    message: ERROR_MESSAGES.PAGE_NOT_FOUND
  })
}

// 全域錯誤處理中間件
const globalErrorHandler = (err, _, res, __) => {
  console.error('全域錯誤:', err.stack)
  
  // 根據錯誤類型決定狀態碼
  const status = err.status || err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
  
  res.status(status).render('error', {
    status,
    title: status === HTTP_STATUS.INTERNAL_SERVER_ERROR ? '伺服器錯誤' : '發生錯誤',
    message: status === HTTP_STATUS.INTERNAL_SERVER_ERROR 
      ? ERROR_MESSAGES.SERVER_ERROR 
      : err.message || '發生未知錯誤'
  })
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
}