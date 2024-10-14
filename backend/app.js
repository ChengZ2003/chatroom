const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const { replace, filtion } = require('verification-sensitive');

// 导入 Message 模型
const Message = require('./models/message');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// 数据库连接
mongoose
  .connect('mongodb://localhost/chatdb')
  .then(() => {
    console.log('MongoDB连接成功');
  })
  .catch((err) => {
    console.error('MongoDB连接失败:', err);
  });

// 路由
app.use(express.static('../frontend/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../frontend/public/index.html');
});

// 保存所有房间和用户
const users = {}; // 用户数据，按 socket.id 存储
const roomUsers = {}; // 按房间存储在线用户列表

function getRoomUsers(room) {
  return roomUsers[room] || [];
}

io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);

  // 监听用户加入房间的事件
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room); // 加入房间
    users[socket.id] = { username, room }; // 保存用户信息

    if (!roomUsers[room]) {
      roomUsers[room] = [];
    }
    roomUsers[room].push(username); // 加入房间用户列表

    // 获取该房间的历史消息
    Message.find({ room }) // 根据 room 字段查询消息
      .then((messages) => {
        socket.emit('loadMessages', messages); // 将历史消息发送给当前用户
        // 发送欢迎信息给当前加入房间的用户
        socket.emit('welcome', { username });
      })
      .catch((err) => {
        console.error('获取历史消息失败:', err);
      });

    // 发送欢迎信息给当前加入房间的用户
    // socket.emit('welcome', { username });

    // 向房间内的其他用户广播新用户加入消息
    socket.broadcast.to(room).emit('newUserJoin', { username });

    // 更新在线用户列表
    io.to(room).emit('updateUserList', getRoomUsers(room));
  });

  // 处理发送消息的事件
  socket.on('sendMessage', ({ username, message, color }) => {
    const user = users[socket.id];
    if (user && user.room) {
      let filteredMessage = filterSensitiveWords(message); // 过滤敏感词
      const messageData = { username, message: filteredMessage, color, room: user.room };

      // 保存消息到数据库
      saveMessageToDatabase(messageData);

      // 广播消息给该房间的所有用户
      io.to(user.room).emit('receiveMessage', messageData);
    }
  });

  // 用户断开连接
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user && user.room) {
      // 从房间用户列表中删除该用户
      roomUsers[user.room] = roomUsers[user.room].filter((username) => username !== user.username);

      // 广播用户离开房间的消息
      io.to(user.room).emit('userLeft', { username: user.username, room: user.room });

      // 更新在线用户列表
      io.to(user.room).emit('updateUserList', roomUsers[user.room]);

      // 删除用户记录
      delete users[socket.id];
    }
  });
});

// 过滤敏感词函数
function filterSensitiveWords(message) {
  let hasSensitiveWord = filtion(message);
  if (hasSensitiveWord) {
    return replace(message, '*');
  } else {
    return message;
  }
}

// 将消息保存到数据库
function saveMessageToDatabase(message) {
  const newMessage = new Message(message);
  return newMessage
    .save()
    .then(() => {
      console.log('消息已成功保存到数据库');
    })
    .catch((err) => {
      console.error('保存消息到数据库失败:', err);
    });
}

// 启动服务器
server.listen(3000, () => {
  console.log('Server running on port 3000');
});
