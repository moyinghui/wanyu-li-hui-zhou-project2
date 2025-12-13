const sessions = new Map(); // sid -> username

function generateSessionId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function setSession(res, username) {
    const sid = generateSessionId();
    sessions.set(sid, username);

    res.cookie("sid", sid, {
        httpOnly: true,
        sameSite: "lax",
    });
}

export function clearSession(req, res) {
    const sid = req.cookies?.sid;
    if (sid) sessions.delete(sid);
    res.clearCookie("sid");
}

export function getUsernameFromSession(req) {
    const sid = req.cookies?.sid;
    if (!sid) return null;
    return sessions.get(sid);
}

export function requireLogin(req, res, next) {
    const username = getUsernameFromSession(req);
    if (!username) {
        return res.status(401).json({ error: "Not logged in" });
    }
    req.username = username;
    next();
}
