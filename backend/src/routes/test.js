import express from 'express';
import { db } from '../../config/database.js';

const router = express.Router();

// 測試端點
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

// 測試數據庫連接
router.get('/db', async (req, res) => {
  try {
    const [result] = await db.execute('SELECT 1 as test');
    res.json({ success: true, data: result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 測試stage_config表
router.get('/stage-config', async (req, res) => {
  try {
    const [stages] = await db.execute('SELECT * FROM stage_config WHERE area_id = 1 AND stage_id = 1');
    res.json({ success: true, data: stages });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

export default router;