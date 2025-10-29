import express from 'express'; 
import { ThemBanGhi , getAll_BMI , getAll_CanNang } from '../../controllers/userController/CanNangVaBMI/ThemBanGhi.js';

const router = express.Router();

router.post('/ThemBanGhi' , ThemBanGhi);


router.get('/getAll_BMI' , getAll_BMI)
router.get('/getAll_CanNang' , getAll_CanNang)

// router.post("/ThemBanGhi", verifyToken, ThemBanGhi);

export default router;
