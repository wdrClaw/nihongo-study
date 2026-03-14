import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database.js';

const router = express.Router();

/**
 * 用戶註冊
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname, email } = req.body;

    // 基本驗證
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用戶名和密碼不能為空'
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        message: '用戶名長度應為3-20個字符'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密碼至少需要6個字符'
      });
    }

    // 檢查用戶名是否已存在
    const [existingUsers] = await db.execute(
      'SELECT id FROM user WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用戶名已被使用'
      });
    }

    // 檢查郵箱是否已存在（如果提供了郵箱）
    if (email) {
      const [existingEmails] = await db.execute(
        'SELECT id FROM user WHERE email = ?',
        [email]
      );

      if (existingEmails.length > 0) {
        return res.status(400).json({
          success: false,
          message: '郵箱已被使用'
        });
      }
    }

    // 密碼加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 創建用戶
    const [result] = await db.execute(
      `INSERT INTO user (username, password_hash, nickname, email, level, exp, coins, last_login_date) 
       VALUES (?, ?, ?, ?, 1, 0, 100, CURDATE())`,
      [username, hashedPassword, nickname || username, email || null]
    );

    const userId = result.insertId;

    // 生成 JWT token
    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 獲取用戶信息（不包含密碼）
    const [users] = await db.execute(
      'SELECT id, username, nickname, email, level, exp, coins, consecutive_days, created_at FROM user WHERE id = ?',
      [userId]
    );

    const user = users[0];

    res.status(201).json({
      success: true,
      message: '註冊成功',
      token,
      user
    });

  } catch (error) {
    console.error('註冊失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 用戶登入
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 基本驗證
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用戶名和密碼不能為空'
      });
    }

    // 查找用戶
    const [users] = await db.execute(
      'SELECT id, username, nickname, email, password_hash, level, exp, coins, consecutive_days, last_login_date FROM user WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用戶名或密碼錯誤'
      });
    }

    const user = users[0];

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用戶名或密碼錯誤'
      });
    }

    // 更新最後登入時間和連續登入天數
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = user.last_login_date?.toISOString()?.split('T')[0];
    
    let consecutiveDays = user.consecutive_days || 0;
    
    if (lastLogin !== today) {
      // 計算連續登入天數
      if (lastLogin) {
        const lastLoginDate = new Date(lastLogin);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastLoginDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // 連續登入
          consecutiveDays += 1;
        } else if (diffDays > 1) {
          // 中斷了，重新開始
          consecutiveDays = 1;
        }
      } else {
        // 首次登入
        consecutiveDays = 1;
      }

      // 更新數據庫
      await db.execute(
        'UPDATE user SET last_login_date = CURDATE(), consecutive_days = ? WHERE id = ?',
        [consecutiveDays, user.id]
      );
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 返回用戶信息（不包含密碼）
    const { password_hash, ...userInfo } = user;
    userInfo.consecutive_days = consecutiveDays;

    res.json({
      success: true,
      message: '登入成功',
      token,
      user: userInfo
    });

  } catch (error) {
    console.error('登入失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * Token 驗證
 * GET /api/auth/verify
 */
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // 獲取用戶信息
    const [users] = await db.execute(
      'SELECT id, username, nickname, email, level, exp, coins, consecutive_days, created_at FROM user WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Token 驗證失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * JWT 中間件 - 驗證 Token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  });
}

// 導出路由和中間件
export default router;
export { authenticateToken };