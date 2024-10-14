#### 一、大作业目的及要求

1. 综合运用HTML、CSS、JavaScript能力。

2. 掌握Node.js项目开发的过程。

3. 掌握Socket.IO中间件提供的各种方法综合运用。

4. 掌握利用Socket.IO中间件实现前端、后端数据的交互方式。

#### 二、实验要求

要求具有以下主要功能：

（1）发送的聊天内容具有敏感词过滤功能。

（2）聊天表情的发送。

（3）用户发送聊天文字颜色设置。

（4）聊天用户列表实现方法。

（5）新用户加入聊天室的欢迎与向其他用户广播新用户加入。

（6）用户关闭聊天室后向其他用户广播用户退出。

（7）在线用户列表。

---

# 具体实现

## 项目目录

```
chatroom/
|-- frontend/
|   |-- public/
|   |   |-- index.html
|   |   |-- chatroom.html
|-- backend/
|   |-- routes/
|   |   |-- ...
|   |-- controllers/
|   |   |-- ...
|   |-- models/
|   |   |-- ...
|   |-- app.js
```

## frontend

### public

#### index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>加入聊天室</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f5f5f5;
            margin: 0;
        }
        #login-container {
            width: 400px;
            padding: 20px;
            background-color: white;
            border: 1px solid #ccc;
            box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h2 {
            margin-bottom: 20px;
        }
        input[type="text"], select {
            width: calc(100% - 24px);
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            width: calc(100% - 24px);
            padding: 10px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>

<div id="login-container">
    <h2>加入聊天室</h2>
    <form id="login-form">
        <div>
            <label for="username">用户名:</label><br>
            <input type="text" id="username" placeholder="输入用户名" required>
        </div>
        <div>
            <label for="room">房间:</label><br>
            <select id="room">
                <option value="JavaScript">JavaScript</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="Web前端">Web前端</option>
                <option value="Node.js">Node.js</option>
            </select>
        </div>
        <button type="submit">加入聊天室</button>
    </form>
</div>

<script>
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const room = document.getElementById('room').value;

        if (username) {
            window.location.href = `chatroom.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(room)}`;
        } else {
            alert('请输入用户名');
        }
    });
</script>

</body>
</html>
```

#### chatroom.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>聊天室</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: auto;
            background-color: white;
            padding: 20px;
            border: 1px solid #ccc;
            box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .messages {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            padding: 10px;
        }
        .input-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
        }
        .input-section textarea {
            width: 90%;
            padding: 10px;
            resize: none;
        }
        .input-section button {
            width: 10%;
            padding: 10px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .input-section button:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>王者聊天室———<span id="room-name"></span>房间</h1>
            <p>欢迎回来: <span id="username"></span></p>
            <p>时间: <span id="time"></span></p>
        </div>
        <div class="messages" id="chat-messages">
            <!-- 聊天记录将在这里显示 -->
        </div>
        <div class="input-section">
            <textarea id="message-input" rows="3" placeholder="体验输入聊天内容"></textarea>
            <button id="send-button">发送消息</button>
            <div id="color-picker">
                <input type="color" id="color-input">
            </div>
        </div>
    </div>
    <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('username');
        const room = urlParams.get('room');

        document.getElementById('username').textContent = username;
        document.getElementById('time').textContent = new Date().toLocaleString();
        document.getElementById('room-name').textContent = room;

        const socket = io(`http://localhost:3000`);

        // 监听连接成功事件
        socket.on('connect', () => {
            console.log('已成功连接到服务器');
        });

        // 初始化聊天记录
        const chatMessages = document.getElementById('chat-messages');

        // 加入聊天室
        socket.emit('joinRoom', { username, room });

        // 接收消息
        socket.on('receiveMessage', ({ username, message, color }) => {
            chatMessages.innerHTML += `<p style="color:${color};"><strong>${username}:</strong> ${message}</p>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        // 用户离开聊天室
        socket.on('userLeft', ({ username, room }) => {
            chatMessages.innerHTML += `<p style="color:red;"><strong>系统消息:</strong> ${username} 已经离开聊天室。</p>`;
        });

        // 发送消息
        document.getElementById('send-button').addEventListener('click', function() {
            const messageInput = document.getElementById('message-input');
            const messageText = messageInput.value.trim();
            if (messageText !== '') {
                // 发送消息
                const color = document.getElementById('color-input').value;
                socket.emit('sendMessage', { username, message: messageText, color, room });
                messageInput.value = '';
            }
        });
    </script>
</body>
</html>
```

#### script.js

```javascript
// 连接到服务器的Socket.IO
const socket = io();

// 获取HTML元素
const messages = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const userList = document.getElementById('users');

// 发送消息
sendBtn.addEventListener('click', () => {
  const msg = chatInput.value;
  if (msg) {
    socket.emit('chat message', msg); // 向服务器发送消息
    chatInput.value = ''; // 发送后清空输入框
  }
});

// 接收来自服务器的消息并显示
socket.on('chat message', (msg) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = msg;
  messages.appendChild(messageElement);
});

// 更新用户列表
socket.on('user list', (users) => {
  userList.innerHTML = ''; // 清空当前列表
  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = user;
    userList.appendChild(li);
  });
});

// 新用户加入提示
socket.on('user joined', (user) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${user} 加入了聊天室`;
  messages.appendChild(messageElement);
});

// 用户离开提示
socket.on('user left', (user) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${user} 离开了聊天室`;
  messages.appendChild(messageElement);
});

```

## backend

### app.js

```javascript
// app.js
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

const users = {};

io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);

  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };
    io.to(room).emit('newUserJoin', { username, room });
  });

  socket.on('sendMessage', ({ username, message, color }) => {
    const user = users[socket.id];
    if (user && user.room) {
      let filteredMessage = filterSensitiveWords(message);
      saveMessageToDatabase({ username, message: filteredMessage, color, room: user.room });
      io.to(user.room).emit('receiveMessage', { username, message: filteredMessage, color });
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user && user.room) {
      io.to(user.room).emit('userLeft', { username: user.username, room: user.room });
      delete users[socket.id];
    }
  });
});

function filterSensitiveWords(message) {
  let hasSensitiveWord = filtion(message);
  if (hasSensitiveWord) {
    return replace(message, '*');
  } else {
    return message;
  }
}

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

server.listen(3000, () => {
  console.log('Server running on port 3000');
});

```

