const config = {
    uri: 'mongodb://username:password@host:port/database',
    database: 'database',
    schemas: ['guilds', 'users'],
    webhook: {
        token: '', 
        id: ''
    }
};

const { writeFile } = require('fs');
const { MongoClient } = require('mongodb');
const { WebhookClient } = require('discord.js');

const create = (database) => {
    config.schemas.forEach(schema => {
        database.collection(schema).find({}).toArray((err, docs) => {
            if (err) return console.log(err);
            if (!config.webhook) return writeFile(`./backups/${schema}-backup.json`, JSON.stringify(docs), (err) => err ? console.log(err) : null);
            let webook = new WebhookClient(config.webhook.id, config.webhook.token);
            webook.send(new Date, {files: [{attachment: Buffer.from(JSON.stringify(docs)), name: `${schema}-backup.json`}]}).catch(err => console.log(err));
        });
    });
};
MongoClient.connect(config.uri, (err, client) => {
    if (!err) console.log('Connected successfully to server');
    else return console.error(err);
    const database = client.db(config.db);
    create(database);
    setInterval(() => create(database), 2 * 60 * 60 * 1000);
});