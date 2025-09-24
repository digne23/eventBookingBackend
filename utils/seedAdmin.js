const User = require('../models/User');

async function ensureAdminExists() {
    const adminEmail = 'sugiradigne@gmail.com';
    const adminPassword = 'sugira123';
    try {
        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            admin = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: adminPassword,
                isAdmin: true,
            });
            console.log('Admin user created');
        } else if (!admin.isAdmin) {
            admin.isAdmin = true;
            await admin.save();
        }
    } catch (e) {
        console.error('Failed to ensure admin exists:', e.message);
    }
}

module.exports = { ensureAdminExists };



