// 404錯誤處理中間件
const notFoundHandler = (_, res) => {
  res.status(404).render('error', {
    status: 404,
    title: '找不到頁面',
    message: '您訪問的頁面不存在'
  })
}

// 全域錯誤處理中間件
const globalErrorHandler = (err, _, res, __) => {
  console.error('全域錯誤:', err.stack)
  
  // 根據錯誤類型決定狀態碼
  const status = err.status || err.statusCode || 500
  
  res.status(status).render('error', {
    status,
    title: status === 500 ? '伺服器錯誤' : '發生錯誤',
    message: status === 500 
      ? '伺服器發生內部錯誤，請稍後再試' 
      : err.message || '發生未知錯誤'
  })
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
}