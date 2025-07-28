const fs = require('fs')
const path = require('path')
const { CACHE, EXTERNAL, PAGINATION } = require('../config/constants')

class MovieModel {
  constructor() {
    this.movies = []
    this.isLoaded = false
    this.loadingPromise = null // 追蹤載入狀態
    this.searchCache = new Map() // 搜尋結果快取
    this.cacheTimeout = CACHE.SEARCH_TIMEOUT
    this.loadingPromise = this.loadMovies()
  }

  // 載入電影資料（異步版本）
  async loadMovies() {
    try {
      const dataPath = path.join(__dirname, EXTERNAL.MOVIE_DATA_PATH)
      const data = await fs.promises.readFile(dataPath, 'utf8')
      const movieData = JSON.parse(data)
      this.movies = movieData.results || []
      this.isLoaded = true
      console.log(`成功載入 ${this.movies.length} 部電影`)
    } catch (error) {
      console.error('載入電影資料失敗:', error)
      this.movies = []
      this.isLoaded = false
      throw error // 重新拋出錯誤，讓調用者知道載入失敗
    }
  }

  // 取得所有電影（異步）
  async getAllMovies() {
    if (!this.isLoaded) {
      await this.loadingPromise
    }
    return this.movies
  }

  // 根據ID取得單部電影（異步）
  async getMovieById(id) {
    const movies = await this.getAllMovies()
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

  // 搜尋電影（附快取功能）（異步）
  async searchMovies(keyword, page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
    const movies = await this.getAllMovies()
    
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

  // 重新載入資料（用於開發時資料更新）（異步）
  async reload() {
    this.searchCache.clear() // 清空快取
    this.loadingPromise = this.loadMovies()
    await this.loadingPromise
    return this.isLoaded
  }

  // 取得電影統計資訊（異步）
  async getStats() {
    const movies = await this.getAllMovies()
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