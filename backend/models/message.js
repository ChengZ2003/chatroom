const mongoose = require('mongoose');

// 定义消息的 Schema 和模型
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  color: String,
  room: String,
  timestamp: { type: Date, default: Date.now },
});

// 导出 Message 模型
module.exports = mongoose.model('Message', messageSchema);
