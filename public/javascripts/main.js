// 防抖動函數
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 載入狀態管理
class LoadingManager {
  constructor() {
    this.loadingElement = null
    this.init()
  }

  init() {
    // 創建載入指示器
    this.loadingElement = document.createElement('div')
    this.loadingElement.id = 'loading-indicator'
    this.loadingElement.className = 'text-center my-3 d-none'
    this.loadingElement.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">載入中...</span>
      </div>
      <p class="mt-2">搜尋中...</p>
    `
    
    // 插入到搜尋表單後面
    const searchBar = document.getElementById('search-bar')
    if (searchBar) {
      searchBar.after(this.loadingElement)
    }
  }

  show() {
    if (this.loadingElement) {
      this.loadingElement.classList.remove('d-none')
    }
  }

  hide() {
    if (this.loadingElement) {
      this.loadingElement.classList.add('d-none')
    }
  }
}

// 搜尋功能
class SearchManager {
  constructor() {
    this.loadingManager = new LoadingManager()
    this.searchInput = null
    this.searchForm = null
    this.dataPanel = null
    this.init()
  }

  init() {
    this.searchInput = document.querySelector('input[name="search"]')
    this.searchForm = document.querySelector('form')
    this.dataPanel = document.getElementById('data-panel')
    
    if (this.searchInput && this.searchForm) {
      this.setupSearch()
    }
  }

  setupSearch() {
    // 防抖動搜尋
    const debouncedSearch = debounce((value) => {
      this.performSearch(value)
    }, 300)

    // 監聽輸入事件
    this.searchInput.addEventListener('input', (e) => {
      const value = e.target.value.trim()
      if (value.length > 0) {
        this.loadingManager.show()
        debouncedSearch(value)
      } else {
        this.loadingManager.hide()
        // 如果清空搜尋，重新載入所有電影
        this.performSearch('')
      }
    })

    // 阻止表單預設提交行為
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const value = this.searchInput.value.trim()
      this.performSearch(value)
    })
  }

  async performSearch(keyword) {
    try {
      // 構建搜尋URL
      const url = keyword ? `/movies?search=${encodeURIComponent(keyword)}` : '/movies'
      
      // 發送AJAX請求
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      
      if (!response.ok) {
        throw new Error('搜尋請求失敗')
      }
      
      // 如果是JSON回應，更新頁面內容
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        this.updateResults(data.movies, keyword)
      } else {
        // 如果不是JSON，重新導向到搜尋頁面
        window.location.href = url
      }
      
    } catch (error) {
      console.error('搜尋錯誤:', error)
      this.showErrorMessage('搜尋時發生錯誤，請稍後再試')
    } finally {
      this.loadingManager.hide()
    }
  }

  updateResults(movies, keyword) {
    if (!this.dataPanel) return

    if (movies.length === 0) {
      this.showNoResults(keyword)
      return
    }

    // 更新電影列表
    const moviesHtml = movies.map(movie => `
      <div class="col-sm-3 mb-3">
        <div class="card h-100 shadow-sm movie-card">
          <a href="/movie/${movie.id}" class="text-secondary text-decoration-none">
            <img class="card-img-top lazy-load" 
                 data-src="https://movie-list.alphacamp.io/posters/${movie.image}" 
                 alt="${movie.title}"
                 src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='150'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E載入中...%3C/text%3E%3C/svg%3E">
          </a>
          <div class="card-body movie-item-body d-flex justify-content-between align-items-center">
            <h6 class="card-title mb-0">${movie.title}</h6>
            <button class="btn btn-primary btn-sm favorite-btn ms-2" 
                    data-movie-id="${movie.id}" 
                    data-movie-title="${movie.title}"
                    data-movie-image="${movie.image}"
                    onclick="event.preventDefault();">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('')

    this.dataPanel.innerHTML = moviesHtml
    
    // 初始化延遲載入
    this.initLazyLoading()
  }

  showNoResults(keyword) {
    if (!this.dataPanel) return
    
    this.dataPanel.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-info" role="alert">
          <h4 class="alert-heading">找不到相關電影</h4>
          <p>沒有找到包含 "<strong>${keyword}</strong>" 的電影。</p>
          <hr>
          <p class="mb-0">
            <button class="btn btn-primary" onclick="searchManager.clearSearch()">
              查看所有電影
            </button>
          </p>
        </div>
      </div>
    `
  }

  showErrorMessage(message) {
    if (!this.dataPanel) return
    
    this.dataPanel.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">發生錯誤</h4>
          <p>${message}</p>
        </div>
      </div>
    `
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = ''
      this.performSearch('')
    }
  }

  initLazyLoading() {
    const images = document.querySelectorAll('.lazy-load')
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            img.classList.remove('lazy-load')
            imageObserver.unobserve(img)
          }
        })
      })

      images.forEach(img => imageObserver.observe(img))
    } else {
      // 降級處理：直接載入所有圖片
      images.forEach(img => {
        img.src = img.dataset.src
        img.classList.remove('lazy-load')
      })
    }
  }
}

// 收藏功能管理
class FavoriteManager {
  constructor() {
    this.favorites = new Set()
    this.init()
  }

  init() {
    this.loadFavorites()
    this.setupEventListeners()
  }

  async loadFavorites() {
    try {
      const response = await fetch('/favorites/api')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          this.favorites = new Set(data.favorites.map(fav => fav.id))
          this.updateFavoriteButtons()
        }
      }
    } catch (error) {
      console.error('載入收藏清單失敗:', error)
    }
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn')) {
        e.preventDefault()
        const btn = e.target.closest('.favorite-btn')
        this.toggleFavorite(btn)
      }
      
      if (e.target.closest('.remove-favorite-btn')) {
        e.preventDefault()
        const btn = e.target.closest('.remove-favorite-btn')
        this.removeFavorite(btn)
      }
    })
  }

  async toggleFavorite(btn) {
    const movieId = parseInt(btn.dataset.movieId)
    const movieTitle = btn.dataset.movieTitle
    const movieImage = btn.dataset.movieImage

    if (this.favorites.has(movieId)) {
      await this.removeFavoriteById(movieId, btn)
    } else {
      await this.addFavorite(movieId, movieTitle, movieImage, btn)
    }
  }

  async addFavorite(movieId, title, image, btn) {
    try {
      btn.disabled = true
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

      const response = await fetch('/favorites/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          movieId,
          title,
          image
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        this.favorites.add(movieId)
        this.updateFavoriteButton(btn, true)
        this.showMessage('已加入收藏清單！', 'success')
      } else {
        this.updateFavoriteButton(btn, false)
        this.showMessage(result.message, 'warning')
      }
    } catch (error) {
      console.error('加入收藏失敗:', error)
      this.updateFavoriteButton(btn, false)
      this.showMessage('加入收藏失敗，請稍後再試', 'danger')
    } finally {
      btn.disabled = false
    }
  }

  async removeFavoriteById(movieId, btn) {
    try {
      btn.disabled = true
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

      const response = await fetch(`/favorites/api/${movieId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        this.favorites.delete(movieId)
        this.updateFavoriteButton(btn, false)
        this.showMessage('已從收藏清單移除', 'info')
      } else {
        this.updateFavoriteButton(btn, true)
        this.showMessage(result.message, 'warning')
      }
    } catch (error) {
      console.error('移除收藏失敗:', error)
      this.updateFavoriteButton(btn, true)
      this.showMessage('移除收藏失敗，請稍後再試', 'danger')
    } finally {
      btn.disabled = false
    }
  }

  async removeFavorite(btn) {
    const movieId = parseInt(btn.dataset.movieId)
    const movieCard = btn.closest('.col-sm-3')
    
    try {
      const response = await fetch(`/favorites/api/${movieId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        this.favorites.delete(movieId)
        
        // 移除卡片動畫
        movieCard.style.transform = 'scale(0)'
        movieCard.style.opacity = '0'
        
        setTimeout(() => {
          movieCard.remove()
          this.updateFavoriteCount()
          
          // 檢查是否還有收藏
          if (document.querySelectorAll('#favorites-panel .col-sm-3').length === 0) {
            this.showEmptyState()
          }
        }, 300)
        
        this.showMessage('已從收藏清單移除', 'info')
      } else {
        this.showMessage(result.message, 'warning')
      }
    } catch (error) {
      console.error('移除收藏失敗:', error)
      this.showMessage('移除收藏失敗，請稍後再試', 'danger')
    }
  }

  updateFavoriteButtons() {
    const buttons = document.querySelectorAll('.favorite-btn')
    buttons.forEach(btn => {
      const movieId = parseInt(btn.dataset.movieId)
      this.updateFavoriteButton(btn, this.favorites.has(movieId))
    })
  }

  updateFavoriteButton(btn, isFavorited) {
    if (isFavorited) {
      btn.classList.remove('btn-primary')
      btn.classList.add('btn-danger')
      btn.innerHTML = '<i class="fas fa-times"></i>'
      btn.title = '從收藏清單移除'
    } else {
      btn.classList.remove('btn-danger')
      btn.classList.add('btn-primary')
      btn.innerHTML = '<i class="fas fa-plus"></i>'
      btn.title = '加入收藏清單'
    }
  }

  updateFavoriteCount() {
    const countElement = document.getElementById('favorite-count')
    if (countElement) {
      const currentCount = document.querySelectorAll('#favorites-panel .col-sm-3').length
      countElement.textContent = currentCount
    }
  }

  showEmptyState() {
    const favoritesPanel = document.getElementById('favorites-panel')
    if (favoritesPanel) {
      favoritesPanel.innerHTML = `
        <div class="col-12 text-center">
          <div class="alert alert-info" role="alert">
            <h4 class="alert-heading">還沒有收藏任何電影</h4>
            <p>快去首頁發現喜歡的電影吧！</p>
            <hr>
            <a href="/" class="btn btn-primary">
              <i class="fas fa-arrow-left"></i> 回到首頁
            </a>
          </div>
        </div>
      `
    }
  }

  showMessage(message, type = 'info') {
    // 移除現有訊息
    const existingAlert = document.querySelector('.favorite-alert')
    if (existingAlert) {
      existingAlert.remove()
    }

    // 創建新訊息
    const alert = document.createElement('div')
    alert.className = `alert alert-${type} favorite-alert position-fixed`
    alert.style.cssText = 'top: 80px; right: 20px; z-index: 1050; min-width: 300px;'
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

    document.body.appendChild(alert)

    // 自動移除
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove()
      }
    }, 3000)
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  window.searchManager = new SearchManager()
  window.favoriteManager = new FavoriteManager()
  
  // 初始化現有圖片的延遲載入
  window.searchManager.initLazyLoading()
  
  // 如果在收藏頁面，載入收藏清單
  if (window.location.pathname === '/favorites') {
    window.favoriteManager.loadFavoritesPage()
  }
})