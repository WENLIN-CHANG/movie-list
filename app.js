const express = require('express')
const { engine } = require('express-handlebars')
const movieRoutes = require('./routes/movies')
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler')
const { SERVER, PAGINATION } = require('./config/constants')

const app = express()
const port = process.env.PORT || SERVER.DEFAULT_PORT

// 設置模板引擎
app.engine('.hbs', engine({
  extname: '.hbs',
  helpers: {
    // 數學運算 helper
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    gt: (a, b) => a > b,
    eq: (a, b) => a === b,
    // 生成分頁範圍
    range: (_, end, current) => {
      const pages = []
      const maxPages = PAGINATION.MAX_PAGES_DISPLAY
      
      let startPage = Math.max(1, current - Math.floor(maxPages / 2))
      let endPage = Math.min(end, startPage + maxPages - 1)
      
      // 調整起始頁
      if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      return pages
    }
  }
}))
app.set('view engine', '.hbs')
app.set('views', './views')

// 靜態檔案中間件
app.use(express.static('public'))

// 路由
app.use('/', movieRoutes)

// 錯誤處理中間件（必須放在所有路由之後）
app.use(notFoundHandler)
app.use(globalErrorHandler)

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})
