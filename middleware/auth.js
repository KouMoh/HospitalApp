module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.username && req.session.userLevel) {
            return next();
        }
        res.redirect('/auth/login');
    },

    isAdmin: (req, res, next) => {
        if (req.session && req.session.isAdmin) {
            return next();
        }
        res.redirect('/auth/admin-login');
    },

    checkLevel: (level) => {
        return (req, res, next) => {
            if (!req.session || !req.session.username || req.session.userLevel !== level) {
                return res.redirect('/auth/login');
            }
            next();
        };
    },

    checkViewAccess: (req, res, next) => {
        if (!req.session || !req.session.username || !req.session.userLevel) {
            return res.redirect('/auth/login');
        }

        const userLevel = req.session.userLevel;
        const requestedLevel = parseInt(req.params.level);

        // Allow Level 3 users to view all levels
        if (userLevel === 3) {
            return next();
        }

        // Allow users to view their own level
        if (userLevel === requestedLevel) {
            return next();
        }

        // Allow Level 1 users to view Level 3 forms only
        if (userLevel === 1 && requestedLevel === 3) {
            return next();
        }

        // Deny access for other cases
        console.error(`Access denied: User level ${userLevel} cannot access level ${requestedLevel}`);
        return res.status(403).send('Access denied: You do not have permission to view this level.');
    }
};
