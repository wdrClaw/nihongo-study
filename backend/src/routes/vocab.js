import express from 'express';
import { db } from '../../config/database.js';

const router = express.Router();

/**
 * GET /api/vocab/categories/list
 * 获取所有词汇分类（必须在 /:category 前面）
 */
router.get('/categories/list', async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT id, name, name_cn, icon, sort_order FROM vocab_category ORDER BY sort_order'
    );
    res.json({ success: true, categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * GET /api/vocab/:category
 * 获取指定分类的词汇
 */
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    let query, params;
    
    if (category === 'mixed') {
      query = 'SELECT v.japanese, v.reading, v.chinese, v.romaji FROM vocab_item v ORDER BY RAND() LIMIT 50';
      params = [];
    } else {
      query = `
        SELECT v.japanese, v.reading, v.chinese, v.romaji 
        FROM vocab_item v 
        JOIN vocab_category c ON v.category_id = c.id 
        WHERE c.name = ? 
        ORDER BY v.level, v.id
      `;
      params = [category];
    }
    
    const [words] = await db.query(query, params);
    
    res.json({
      success: true,
      words,
      total: words.length
    });
    
  } catch (error) {
    console.error('获取词汇失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
