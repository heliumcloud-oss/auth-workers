import { IRequest } from "itty-router";
import { connection } from "../database";
import { deleteSession, parseCookie, tokenCookie, verifySession } from "../helpers";
import { router } from "../index";
import { formatError, formatResponse } from "../responder";

router.delete('/v1/logoutAll', async (req: IRequest) => {
    let loggedIn = await verifySession(parseCookie(req.headers.get('Cookie')));
    if(!loggedIn) return formatError("Unauthorized", 401);
    // @ts-ignore
    let query = await connection.execute(`DELETE FROM sessions WHERE user = ?;`, [loggedIn['userData']['id']]);
    return formatResponse({
        error: false,
        message: "All sessions for your user are now invalid.",
        count: query.rowsAffected
    }, {
        "Set-Cookie": tokenCookie("")
    })
});
