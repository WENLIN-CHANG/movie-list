const fs = require('fs')
const path = require('path')

class MovieModel {
  constructor() {
    this.movies = []
    this.isLoaded = false
    this.searchCache = new Map() // 搜尋結果快取
    this.cacheTimeout = 5 * 60 * 1000 // 5分鐘快取過期
    this.loadMovies()
  }

  // 載入電影資料
  loadMovies() {
    try {
      const dataPath = path.join(__dirname, '../public/jsons/movies.json')
      const data = fs.readFileSync(dataPath, 'utf8')
      const movieData = JSON.parse(data)
      this.movies = movieData.results || []
      this.isLoaded = true
      console.log(`成功載入 ${this.movies.length} 部電影`)
    } catch (error) {
      console.error('載入電影資料失敗:', error)
      this.movies = []
      this.isLoaded = false
    }
  }

  // 取得所有電影
  getAllMovies() {
    if (!this.isLoaded) {
      this.loadMovies()
    }
    return this.movies
  }

  // 根據ID取得單部電影
  getMovieById(id) {
    const movies = this.getAllMovies()
    return movies.find(movie => movie.id.toString() === id.toString())
  }

  // 清理過期的快取項目
  cleanExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.searchCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.searchCache.delete(key)
      }
    }
  }

  // 搜尋電影（附快取功能）
  searchMovies(keyword, page = 1, limit = 20) {
    const movies = this.getAllMovies()
    
    let filteredMovies = movies
    
    if (keyword) {
      // 檢查快取
      const cacheKey = keyword.toLowerCase()
      const cached = this.searchCache.get(cacheKey)
      
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        console.log(`從快取返回搜尋結果: "${keyword}"`)
        filteredMovies = cached.results
      } else {
        // 執行搜尋
        console.log(`執行新搜尋: "${keyword}"`)
        const lowerKeyword = keyword.toLowerCase()
        filteredMovies = movies.filter(movie => {
          return Object.values(movie).some(property => {
            if (typeof property === 'string') {
              return property.toLowerCase().includes(lowerKeyword)
            }
            return false
          })
        })

        // 儲存到快取
        this.searchCache.set(cacheKey, {
          results: filteredMovies,
          timestamp: Date.now()
        })

        // 清理過期快取
        this.cleanExpiredCache()
      }
    }

    // 分頁邏輯
    const total = filteredMovies.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedMovies = filteredMovies.slice(offset, offset + limit)

    return {
      movies: paginatedMovies,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  // 重新載入資料（用於開發時資料更新）
  reload() {
    this.searchCache.clear() // 清空快取
    this.loadMovies()
    return this.isLoaded
  }

  // 取得電影統計資訊
  getStats() {
    const movies = this.getAllMovies()
    return {
      total: movies.length,
      isLoaded: this.isLoaded,
      cacheSize: this.searchCache.size,
      lastLoaded: new Date().toISOString()
    }
  }

  // 清空搜尋快取
  clearCache() {
    this.searchCache.clear()
    console.log('搜尋快取已清空')
  }
}

// 創建單例實例
const movieModel = new MovieModel()

module.exports = movieModel