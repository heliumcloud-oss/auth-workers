import { bcryptHash, bcryptVerify } from "./bcrypt";
import { RequestLike, Router } from 'itty-router';
import { createCors } from "itty-cors";

export const router = Router();
const { preflight, corsify } = createCors();
// @ts-ignore (for some reason, this is not the correct type)
router.all('*', preflight);

export default {
	fetch: (...args) => router
		.handle(...args)
		.catch(err => new Response(JSON.stringify({
			error: true,
			message: "We had an issue executing your request. Send the below error to support@bubblez.app.",
			err: err.message
		}), { 
			status: 500, 
			headers: { "Content-Type": "application/json" } 
		}))
		.then(corsify)
}