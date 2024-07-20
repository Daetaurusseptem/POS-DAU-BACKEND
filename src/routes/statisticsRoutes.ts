import express from 'express';
import { getSalesStatistics, getItemsStatistics, getIngredientsStatistics, getTopSellingProductsByWeek } from '../controllers/statisticsController';

const router = express.Router();

router.get('/sales', getSalesStatistics);
router.get('/items', getItemsStatistics);
router.get('/ingredients', getIngredientsStatistics);
router.get('/top-selling-products', getTopSellingProductsByWeek);

export default router;
