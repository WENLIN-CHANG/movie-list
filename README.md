# 電影清單 Movie List

一個專為電影愛好者打造的全功能網頁應用程式，提供電影瀏覽、搜尋和收藏管理功能。

## 🎬 功能特色

### 核心功能
- **電影瀏覽**：瀏覽完整的電影資料庫
- **智慧搜尋**：即時搜尋電影標題，支援防抖動優化
- **收藏管理**：將喜愛的電影加入個人收藏清單
- **分頁顯示**：流暢的分頁瀏覽體驗
- **響應式設計**：支援桌面和行動裝置

### 搜尋功能
- 在搜尋欄位中輸入電影標題即可進行即時搜尋
- 支援防抖動技術，提升使用者體驗
- 搜尋結果即時更新，無需重新載入頁面

### 收藏清單
- 在首頁中，點擊電影標題旁的**藍色 `+` 按鈕**即可將電影加入收藏清單
- 收藏後按鈕會變成**紅色 `×` 按鈕**，可快速移除收藏
- 在導航欄點擊「收藏清單」可查看所有已收藏的電影
- 支援收藏日期顯示和動畫效果

## 🛠 技術架構

### 後端技術
- **Node.js**: JavaScript 運行環境
- **Express.js**: 輕量級網頁應用框架
- **Express-Handlebars**: 模板引擎，支援動態內容渲染
- **Winston**: 專業級日誌記錄系統

### 前端技術
- **Bootstrap 5**: 響應式 CSS 框架
- **Font Awesome**: 圖示字體庫
- **Vanilla JavaScript**: 原生 JavaScript，包含 ES6+ 特性
- **Fetch API**: 現代化的 HTTP 請求處理

### 資料存儲
- **JSON 檔案**: 電影資料和收藏清單的本地存儲
- **檔案系統**: 持久化收藏資料

## 📁 專案結構

```
movie-list/
├── app.js                 # 應用程式入口點
├── package.json           # 專案依賴和腳本
├── config/                # 配置檔案
│   ├── constants.js       # 應用程式常數
│   └── logger.js          # 日誌配置
├── controllers/           # 控制器層
│   └── movieController.js # 電影業務邏輯
├── middleware/            # 中介軟體
│   ├── errorHandler.js    # 錯誤處理中介軟體
│   └── validation.js      # 輸入驗證中介軟體
├── models/                # 資料模型層
│   ├── movieModel.js      # 電影資料模型
│   └── favoriteModel.js   # 收藏資料模型
├── routes/                # 路由層
│   ├── movies.js          # 電影相關路由
│   └── favorites.js       # 收藏相關路由
├── views/                 # 視圖模板
│   ├── layouts/           # 版面配置
│   │   └── main.hbs       # 主要版面
│   ├── index.hbs          # 首頁模板
│   ├── detail.hbs         # 電影詳情頁
│   ├── favorites.hbs      # 收藏清單頁
│   └── error.hbs          # 錯誤頁面
├── public/                # 靜態資源
│   ├── javascripts/       # JavaScript 檔案
│   │   └── main.js        # 前端主要邏輯
│   ├── stylesheets/       # CSS 檔案
│   └── jsons/             # JSON 資料檔案
│       └── movies.json    # 電影資料
├── data/                  # 應用程式資料
│   └── favorites.json     # 收藏清單資料
├── utils/                 # 工具函數
│   └── responseUtils.js   # 回應處理工具
└── logs/                  # 日誌檔案
    ├── combined.log       # 綜合日誌
    ├── error.log          # 錯誤日誌
    ├── exceptions.log     # 例外日誌
    └── rejections.log     # Promise 拒絕日誌
```

## 🏗 架構設計

### MVC 架構模式
- **Model**: 處理資料邏輯和資料庫操作
- **View**: 負責使用者介面的呈現
- **Controller**: 協調 Model 和 View 之間的互動

### RESTful API 設計
- `GET /` - 首頁電影清單
- `GET /movie/:id` - 電影詳情頁面
- `GET /favorites` - 收藏清單頁面
- `GET /favorites/api` - 取得收藏清單 API
- `POST /favorites/api` - 新增收藏 API
- `DELETE /favorites/api/:id` - 移除收藏 API

### 中介軟體系統
- **錯誤處理**: 統一的錯誤處理機制
- **輸入驗證**: 安全的使用者輸入驗證
- **日誌記錄**: 完整的系統行為記錄

## 🚀 快速開始

### 環境需求
- Node.js 16.0 或更高版本
- npm 或 yarn 套件管理器

### 安裝步驟

1. **複製專案**
   ```bash
   git clone <repository-url>
   cd movie-list
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動應用程式**
   ```bash
   npm start
   ```

4. **開發模式**（支援自動重新載入）
   ```bash
   npm run dev
   ```

5. **瀏覽應用程式**
   開啟瀏覽器，前往 `http://localhost:3000`

## 🔧 開發指令

- `npm start` - 啟動生產環境伺服器
- `npm run dev` - 啟動開發環境伺服器（支援自動重新載入）

## 📝 開發特色

### 程式碼品質
- 完整的 JSDoc 文件註解
- 統一的程式碼風格
- 模組化的檔案結構

### 使用者體驗
- 載入動畫和狀態指示
- 即時回饋訊息
- 平滑的動畫效果
- 響應式介面設計

### 效能優化
- 圖片延遲載入（Lazy Loading）
- 搜尋防抖動處理
- 高效的狀態管理

### 錯誤處理
- 完善的錯誤捕獲機制
- 使用者友善的錯誤訊息
- 詳細的伺服器端日誌記錄

## 🔐 安全特性

- 輸入驗證和清理
- XSS 攻擊防護
- 安全的資料處理

## 📄 授權

此專案使用 ISC 授權條款。

---

> 這是一個展示現代網頁開發技術的專案，結合了 Node.js 後端和響應式前端設計，適合學習和參考使用。