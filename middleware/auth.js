module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.username) {
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
            if (!req.session || !req.session.username) {
                return res.redirect('/auth/login');
            }
            next();
        };
    },

    checkViewAccess: (req, res, next) => {
        if (!req.session || !req.session.username) {
            return res.redirect('/auth/login');
        }

        const userLevel = req.session.userLevel;
        const requestedLevel = parseInt(req.params.level);

        if (userLevel === 1 && requestedLevel === 3) return next();
        if (userLevel === 3 && (requestedLevel === 1 || requestedLevel === 2)) return next();
        
        return res.status(403).render('error', { 
            message: 'You do not have view access to this level' 
        });
    }
};
