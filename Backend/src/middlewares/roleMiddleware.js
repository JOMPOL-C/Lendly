module.exports = {
    requireLogin: (req, res, next) => {
        if (!req.user) {
            console.log("🚫 [AUTH] ผู้ใช้ยังไม่ได้ล็อกอิน");
            return res.redirect("/login");
        }
        next();
    },

    requireAdmin: (req, res, next) => {
        if (!req.user) {
            console.log("🚫 [AUTH] ยังไม่ได้ล็อกอิน");
            return res.redirect("/login");
        }
        if (req.user.role !== "ADMIN") {
            console.log("🚫 [ROLE] ไม่ใช่แอดมิน");
            return res.redirect("/");
        }
        next();
    },

    requireUser: (req, res, next) => {
        if (!req.user) {
            console.log("🚫 [AUTH] ยังไม่ได้ล็อกอิน");
            return res.redirect("/login");
        }
        if (!["USER", "ADMIN"].includes(req.user.role)) {
            console.log("🚫 [ROLE] ไม่มีสิทธิ์ใช้งานส่วนผู้ใช้");
            return res.redirect("/");
        }
        next();
    }

};
