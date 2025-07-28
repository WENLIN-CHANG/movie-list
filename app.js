const express = require('express')
const { engine } = require('express-handlebars')
const app = express()
const port = process.env.PORT || 3000
const movies = require('./public/jsons/movies.json').results
const BASE_IMG_URL = 'https://movie-list.alphacamp.io/posters/'

app.engine('.hbs', engine({extname: '.hbs'}))
app.set('view engine', '.hbs')
app.set('views', './views')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect('/movies')
})

app.get('/movies', (req, res) => {
  let keyword = req.query.search
  
  // 輸入驗證和清理
  if (keyword) {
    keyword = keyword.trim()
    
    // 限制搜尋關鍵字長度，防止惡意長字串
    if (keyword.length > 100) {
      keyword = keyword.substring(0, 100)
    }
    
    // 移除危險字符，只保留字母、數字、空格和基本標點
    keyword = keyword.replace(/[^\w\s\u4e00-\u9fff.-]/g, '')
    
    // 如果清理後為空，設為null
    if (!keyword) {
      keyword = null
    }
  }
  
  const matchedMovies = keyword ? movies.filter((mv) =>
    Object.values(mv).some((property) => {
      if (typeof property === 'string') {
        return property.toLowerCase().includes(keyword.toLowerCase())
      }
      return false
    })
  ) : movies
  res.render('index', { movies: matchedMovies, BASE_IMG_URL, keyword })
})

app.get('/movie/:id', (req, res) => {
  const id = req.params.id
  
  // 驗證ID是否為有效數字
  if (!id || isNaN(id)) {
    return res.status(400).render('error', {
      status: 400,
      title: '錯誤請求',
      message: '無效的電影ID'
    })
  }
  
  const movie = movies.find((mv) => mv.id.toString() === id)
  
  // 如果找不到電影，返回404
  if (!movie) {
    return res.status(404).render('error', {
      status: 404,
      title: '找不到頁面',
      message: '指定的電影不存在'
    })
  }
  
  res.render('detail', { movie, BASE_IMG_URL })
})

// 404錯誤處理 - 必須放在所有路由之後
app.use((_, res) => {
  res.status(404).render('error', {
    status: 404,
    title: '找不到頁面',
    message: '您訪問的頁面不存在'
  })
})

// 全域錯誤處理中間件
app.use((err, _, res, __) => {
  console.error('錯誤詳情:', err.stack)
  res.status(500).render('error', {
    status: 500,
    title: '伺服器錯誤',
    message: '伺服器發生內部錯誤，請稍後再試'
  })
})

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})
