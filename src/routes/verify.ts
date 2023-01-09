import { IRequest } from "itty-router";
import { connection } from "../database";
import { deleteSession, parseCookie, tokenCookie, verifySession } from "../helpers";
import { router } from "../index";
import { formatError, formatResponse } from "../responder";

router.get('/v1/verify', async (req: IRequest) => {
    let loggedIn = await verifySession(parseCookie(req.headers.get('Cookie') || req.query['session']));
    if(!loggedIn) return formatError("Unauthorized", 401);
    return formatResponse({
        error: false,
        user: loggedIn['userData']
    });
});
