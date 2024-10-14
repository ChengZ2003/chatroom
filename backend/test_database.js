const mongoose = require('mongoose');
// 使用动态导入
import('chai').then((chai) => {
  const expect = chai.expect;
  const Message = require('./models/message');

  describe('Database Tests', function () {
    before(async function () {
      await mongoose.connect('mongodb://localhost/chatdb', {
        useNewUrlParser: false,
        useUnifiedTopology: false,
      });
      const db = mongoose.connection;
      db.on('error', console.error.bind(console, '连接数据库错误:'));
      db.once('open', function () {
        console.log('测试数据库连接成功');
      });
    });

    after(async function () {
      await mongoose.connection.close();
      console.log('测试数据库连接已关闭');
    });

    it('应该能够保存消息到数据库', async function () {
      const testMessage = {
        username: 'testUser',
        message: '这是一条测试消息',
        color: '#000000',
        room: 'testRoom',
      };
      const newMessage = new Message(testMessage);
      await newMessage.save();
      expect(err).to.be.null;
    });

    it('应该能够从数据库查询消息', async function () {
      const messages = await Message.find({});
      expect(err).to.be.null;
      expect(messages).to.be.an('array');
    });
  });
});
