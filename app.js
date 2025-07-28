const express = require('express')
const { engine } = require('express-handlebars')
const movieRoutes = require('./routes/movies')
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler')

const app = express()
const port = process.env.PORT || 3000

// 設置模板引擎
app.engine('.hbs', engine({extname: '.hbs'}))
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
