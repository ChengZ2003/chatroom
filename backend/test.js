const { replace, filtion } = require('verification-sensitive');

// 使用replace 返回值为 字符串(被替换后的字符串)
let originalStr = '你好！你麻痹!';
let flag = filtion(originalStr);

if (flag) {
  let str = replace(originalStr, '*');
  console.log(str); // 输出：你***麻痹!
}

// let str = replace('你大爷', '***');

// console.log(str); // 输出：你**

// // 使用 返回值为 Boolean类型(true含有敏感词,false无敏感词)
// let flag = filtion('检索词');
