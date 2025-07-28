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
      <div class="col-sm-3">
        <a href="/movie/${movie.id}" class="text-secondary">
          <div class="card mb-2">
            <img class="card-img-top lazy-load" 
                 data-src="https://movie-list.alphacamp.io/posters/${movie.image}" 
                 alt="${movie.title}"
                 src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='150'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E載入中...%3C/text%3E%3C/svg%3E">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${movie.title}</h6>
            </div>
          </div>
        </a>
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  window.searchManager = new SearchManager()
  
  // 初始化現有圖片的延遲載入
  window.searchManager.initLazyLoading()
})