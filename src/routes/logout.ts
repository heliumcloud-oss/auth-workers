import { IRequest } from "itty-router";
import { deleteSession, parseCookie, tokenCookie, verifySession } from "../helpers";
import { router } from "../index";
import { formatError, formatResponse } from "../responder";

router.delete('/v1/logout', async (req: IRequest) => {
    let loggedIn = await verifySession(parseCookie(req.headers.get('Cookie')));
    if(!loggedIn) return formatError("Unauthorized", 401);
    let deleted = deleteSession(loggedIn.token);
    if(!deleted) return formatError(`Your session is already deleted.`, 404);
    return formatResponse( {
        error: false,
        message: "You've been logged out."
    }, {
        "Set-Cookie": tokenCookie("")
    });
});
