// require bcryptjs
import bcrypt from 'bcryptjs';

// Sinh hash từ mật khẩu plaintext
const plaintext = '123';
const saltRounds = 10; // phổ biến là 10 hoặc 12

bcrypt.genSalt(saltRounds, (err, salt) => {
  if (err) throw err;
  bcrypt.hash(plaintext, salt, (err, hash) => {
    if (err) throw err;
    console.log('Hash:', hash);
    // hash có thể insert trực tiếp vào DB
  });
});
