import { IRequest } from "itty-router";
import { bcryptHash } from "../bcrypt";
import { connection } from "../database";
import { v4 as uuidv4 } from 'uuid';
import { createSession, tokenCookie, validateEmail, validatePassword, validateUsername } from "../helpers";
import { router } from "../index";
import { formatError, formatResponse } from "../responder";

router.put('/v1/register', async (req: IRequest) => {
    if(!req.headers.get('Content-Type').startsWith("multipart/form-data")) return formatError("Bad Request", 400);
    let formData = await req.formData();
    if(!formData.get('username') || !formData.get('password') || !formData.get("email") || !formData.get("displayName")) return formatError("Bad Request", 400);
    if(!validateUsername(formData.get("username")) || !validatePassword(formData.get("password")) || !validateEmail(formData.get("email"))) return formatError("Invalid username, email or password.", 422);
    let testUniqueValues = await connection.execute(`SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1;`, [formData.get("username"), formData.get("email")]);
    if(testUniqueValues.rows[0]) {
        let found = testUniqueValues.rows[0];
        // @ts-ignore
        if(found['username'] == formData.get("username")) return formatError("User already exists", 409);
        // @ts-ignore
        if(found['email'] == formData.get("email")) return formatError("Email already exists", 409);
    }

    let hashedPassword = bcryptHash(formData.get("password"));
    let newUserObject = {
        username: String(formData.get("username")).toLowerCase(),
        displayName: formData.get("displayName"),
        email: formData.get("email"),
        badges: [],
        bio: "",
        coins: 0,
        supporter: {
            patreon: false,
            booster: false
        },
        auth: {
            pass: hashed,
            level: 0
        },
        images: {
            avatar: false,
            banner: false
        },
        personalization: {
            color: "#00cc99",
            pronouns: [],
            pinned: null,
        },
        settings: {
            theme: "dark",
            private: false,
            noFollow: false,
            hideFollow: false,
            hideBio: false,
            invisible: false,
            nsfw: false,
        },
        integration: {
            discord: null
        },
        admin: {
            breached: false,
            ban: null,
            ip: null
        },
        stats: {
            created: Math.floor(Date.now() / 1000),
            lastPost: Math.floor(Date.now() / 1000),
            lastOnline: Math.floor(Date.now() / 1000),
            status: 0
        },
        following: [],
        followers: []
    }
    let newid = uuidv4();
    let importUser = await connection.execute(`INSERT INTO users(id, username, displayName, email, bio, badges, coins, supporter, auth, images, personalization, settings, integration, admin, stats, following, followers) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        newid,
        newUserObject.username,
        newUserObject.displayName,
        newUserObject.email,
        newUserObject.bio,
        newUserObject.badges,
        newUserObject.coins,
        newUserObject.supporter,
        newUserObject.auth,
        newUserObject.images,
        newUserObject.personalization,
        newUserObject.settings,
        newUserObject.integration,
        newUserObject.admin,
        newUserObject.stats,
        newUserObject.following,
        newUserObject.followers
    ]);
    if(importUser.rowsAffected !== 1) return formatError("Something went wrong.", 500);
    let newSession = await createSession(newid);
    return formatResponse({ error: false, uuid: newid, session: newSession }, { "Set-Cookie": tokenCookie(newSession) })

})