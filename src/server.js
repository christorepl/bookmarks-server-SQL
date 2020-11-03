const knex = require('knex')
// const app = require('./app')
// const bookmarksRouter = require('./bookmarks/bookmark-router')
const app = require('./bookmarks/bookmark-router')
const { PORT, DB_URL } = require('./config')

const db = knex({
    client: 'pg',
    connection: DB_URL
})

// app.set('db', db)

app.set('db', db)

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})