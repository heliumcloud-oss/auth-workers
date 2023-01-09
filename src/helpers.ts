import { v4 as uuidv4 } from 'uuid';
import { parse, serialize } from 'cookie';
import { connection } from './database';

export async function createSession(uid: string) {
    let id = uuidv4();
    let query = await connection.execute(`INSERT INTO sessions(id, user) VALUES(?, ?)`, [id, uid]);
    return id;
}

export function tokenCookie(session: string) {
    return serialize('bSESSION', session, {
        path: '/',
        httpOnly: true,
        maxAge: 86400,
        sameSite: "lax",
        // @ts-ignore
        port: globalThis.MINIFLARE ? null : 5173,
        // @ts-ignore
        secure: globalThis.MINIFLARE ? false : true
    })
}

export function parseCookie(cookieHeader: string = '') {
    let cookie = parse(cookieHeader);
    return cookie['bSESSION'];
}

export async function verifySession(token: string) {
    if(!token) return false;
    let query = await connection.execute(`SELECT * FROM sessions WHERE id = ? LIMIT 1;`, [token]);
    if(!query.rows[0]) return false;
    // @ts-ignore
    let query2 = await connection.execute(`SELECT * FROM users WHERE id = ? LIMIT 1;`, [query.rows[0]['user']]);
    if(!query2.rows[0]) return false;
    let userData = query2.rows[0];
    // @ts-ignore
    delete userData['auth']['pass'];
    return { userData, token };
}

export async function deleteSession(token: string) {
    let query = await connection.execute(`DELETE FROM sessions WHERE id = ? LIMIT 1;`, [token]);
    if(query.rowsAffected == 1) return true;
    return false;
}

export function validateUsername(username: string){
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username) && username.length <= 15 && username.length > 3;
}
  
export function validatePassword(password: string) {
    return password.length >= 6;
}
  
export const validateEmail = (email: string) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};