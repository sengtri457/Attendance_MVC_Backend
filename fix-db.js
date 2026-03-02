const sequelize = require('./config/database');
const {QueryTypes} = require('sequelize');

async function fixDb() {
    try {
        const indexes = await sequelize.query('SHOW INDEXES FROM users WHERE Key_name LIKE "username%"', {type: QueryTypes.SELECT});

        console.log(`Found ${
            indexes.length
        } username indexes.`);
        for (let i = 1; i < indexes.length; i++) { // keep the first one
            const index = indexes[i];
            if (index.Key_name !== 'PRIMARY') {
                console.log(`Dropping index ${
                    index.Key_name
                }`);
                await sequelize.query(`ALTER TABLE users DROP INDEX \`${
                    index.Key_name
                }\``);
            }
        }

        const emailIndexes = await sequelize.query('SHOW INDEXES FROM users WHERE Key_name LIKE "email%"', {type: QueryTypes.SELECT});
        for (let i = 1; i < emailIndexes.length; i++) {
            const index = emailIndexes[i];
            if (index.Key_name !== 'PRIMARY') {
                console.log(`Dropping index ${
                    index.Key_name
                }`);
                await sequelize.query(`ALTER TABLE users DROP INDEX \`${
                    index.Key_name
                }\``);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixDb();
