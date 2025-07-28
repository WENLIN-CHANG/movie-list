/**
 * 日誌配置模組
 * @module config/logger
 */

const winston = require('winston')
const path = require('path')

/**
 * 創建日誌格式
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`
  })
)

/**
 * 創建日誌實例
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 錯誤日誌檔案
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 一般日誌檔案
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  // 未捕獲的例外處理
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  ],
  // 未處理的Promise拒絕
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log')
    })
  ]
})

// 開發環境下也輸出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

/**
 * 創建日誌目錄（如果不存在）
 */
const fs = require('fs')
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

module.exports = logger