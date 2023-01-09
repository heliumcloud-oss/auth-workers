import { IRequest } from "itty-router";
import { bcryptVerify } from "../bcrypt";
import { connection } from "../database";
import { createSession, tokenCookie } from "../helpers";
import { router } from "../index";
import { formatError, formatResponse } from "../responder";

router.post('/v1/login', async (req: IRequest) => {
    if(!req.headers.get('Content-Type').startsWith("multipart/form-data")) return formatError("Bad Request", 400);
    let formData = await req.formData();
    if(!formData.get('username') || !formData.get('password')) return formatError("Bad Request", 400);
    let users = await connection.execute(`SELECT * FROM users WHERE username=? LIMIT 1;`, [formData.get('username')]);
    if(!users.rows[0]) return formatError("User does not exist.", 404);
    let user = users.rows[0];
    // @ts-ignore i do not feel like doing types for the response.
    let userHash = user['auth']['pass'].replace('$2y$', '$2a$');
    let verifyHash = await bcryptVerify(formData.get('password'), userHash);
    if(!verifyHash) return formatError("The password you entered was incorrect.", 403);
    // @ts-ignore
    let session = await createSession(user['id']);
    return formatResponse({ error: false, session: user }, { "Set-Cookie": tokenCookie(session) })
});
