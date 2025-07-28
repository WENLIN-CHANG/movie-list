const fs = require('fs').promises
const path = require('path')
const logger = require('../config/logger')

class FavoriteModel {
  constructor() {
    this.favoritesPath = path.join(__dirname, '../data/favorites.json')
    this.ensureDataDirectory()
  }

  async ensureDataDirectory() {
    try {
      const dataDir = path.join(__dirname, '../data')
      await fs.mkdir(dataDir, { recursive: true })
      
      try {
        await fs.access(this.favoritesPath)
      } catch (error) {
        if (error.code === 'ENOENT') {
          await fs.writeFile(this.favoritesPath, JSON.stringify([]))
          logger.info('Created favorites.json file')
        }
      }
    } catch (error) {
      logger.error('Error ensuring data directory:', error)
    }
  }

  async getFavorites() {
    try {
      const data = await fs.readFile(this.favoritesPath, 'utf8')
      if (!data.trim()) {
        return []
      }
      return JSON.parse(data)
    } catch (error) {
      logger.error('Error reading favorites:', error)
      // 如果文件損壞，重新創建空陣列
      await fs.writeFile(this.favoritesPath, JSON.stringify([], null, 2))
      return []
    }
  }

  async addFavorite(movie) {
    try {
      const favorites = await this.getFavorites()
      
      const existingIndex = favorites.findIndex(fav => fav.id === movie.id)
      if (existingIndex !== -1) {
        return { success: false, message: '電影已在收藏清單中' }
      }

      const favoriteMovie = {
        id: movie.id,
        title: movie.title,
        image: movie.image,
        addedAt: new Date().toISOString()
      }

      favorites.push(favoriteMovie)
      await fs.writeFile(this.favoritesPath, JSON.stringify(favorites, null, 2))
      
      logger.info(`Added movie to favorites: ${movie.title}`)
      return { success: true, message: '已加入收藏清單', movie: favoriteMovie }
    } catch (error) {
      logger.error('Error adding favorite:', error)
      return { success: false, message: '加入收藏失敗' }
    }
  }

  async removeFavorite(movieId) {
    try {
      const favorites = await this.getFavorites()
      const originalLength = favorites.length
      
      const filteredFavorites = favorites.filter(fav => fav.id !== parseInt(movieId))
      
      if (filteredFavorites.length === originalLength) {
        return { success: false, message: '電影不在收藏清單中' }
      }

      await fs.writeFile(this.favoritesPath, JSON.stringify(filteredFavorites, null, 2))
      
      logger.info(`Removed movie from favorites: ${movieId}`)
      return { success: true, message: '已從收藏清單移除' }
    } catch (error) {
      logger.error('Error removing favorite:', error)
      return { success: false, message: '移除收藏失敗' }
    }
  }

  async isFavorite(movieId) {
    try {
      const favorites = await this.getFavorites()
      return favorites.some(fav => fav.id === parseInt(movieId))
    } catch (error) {
      logger.error('Error checking favorite status:', error)
      return false
    }
  }

  async getFavoritesCount() {
    try {
      const favorites = await this.getFavorites()
      return favorites.length
    } catch (error) {
      logger.error('Error getting favorites count:', error)
      return 0
    }
  }
}

module.exports = new FavoriteModel()