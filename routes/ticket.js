import {Router} from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import { createTicket, getTicket, getTickets } from "../controllers/ticketController.js";
const router = Router();

router.get('/:id', isAuthenticated, getTicket);
router.get('/',isAuthenticated,getTickets);
router.post('/',isAuthenticated, createTicket);

export default router;