// 驗證和清理搜尋參數
const validateAndSanitizeSearch = (searchParam) => {
  if (!searchParam) {
    return null
  }

  let keyword = searchParam.trim()
  
  // 限制搜尋關鍵字長度，防止惡意長字串
  if (keyword.length > 100) {
    keyword = keyword.substring(0, 100)
  }
  
  // 移除危險字符，只保留字母、數字、空格和基本標點
  keyword = keyword.replace(/[^\w\s\u4e00-\u9fff.-]/g, '')
  
  // 如果清理後為空，設為null
  return keyword || null
}

// 驗證電影ID
const validateMovieId = (id) => {
  if (!id) {
    return '電影ID不能為空'
  }
  
  if (isNaN(id)) {
    return '無效的電影ID格式'
  }
  
  const numId = parseInt(id)
  if (numId <= 0) {
    return '電影ID必須為正整數'
  }
  
  return null // 無錯誤
}

module.exports = {
  validateAndSanitizeSearch,
  validateMovieId
}