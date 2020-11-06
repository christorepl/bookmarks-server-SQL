const express = require('express')
// const { v4: uuid } = require('uuid')
const xss = require('xss')
const BookmarksService = require('./bookmarks-service')
const logger = require('../logger')
const bodyParser = express.json()
const bookmarkRouter = express.Router()
const jsonParser = express.json()

sanitizeBookmark = bookmark => ({
    id: bookmark.id,
    description: xss(bookmark.description),
    title: xss(bookmark.title),
    url: xss(bookmark.url),
    rating: xss(bookmark.rating)
})

bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(sanitizeBookmark))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {

    const { title, url, description, rating } = req.body

    if (rating > 10 || rating < 0) {
        return res.status(400).json({
            error : { message : `Rating must be an integer between 0 and 10. ${rating} is not a valid entry.`}
        })
    }

    const newBookmark = {
        title,
        url,
        description,
        rating
    }

    for (const [key, value] of Object.entries(newBookmark)) {
        if (value == null) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })
        }
    }

    BookmarksService.insertBookmark(
        req.app.get('db'),
        newBookmark
    )
    .then(bookmark => {
    res
        .status(201)
        .location(`/bookmarks/${bookmark.id}`)
        .json(sanitizeBookmark(bookmark))
})
    .catch(next)
})

bookmarkRouter
    .route('/bookmarks/:id')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.id
        )
        .then(bookmark => {
            if(!bookmark) {
                return res.status(404).json({
                    error: { message: `Bookmark doesn't exist`}
                })
            }
            res.bookmark = bookmark
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        // const bookmark_id = req.params.id
        // const knexInstance = req.app.get('db')
        // BookmarksService.getById(knexInstance, bookmark_id)
        //     .then(bookmark => {
        //         if(!bookmark) {
        //             return res.status(404).json({error: { message: `Bookmark doesn't exist`}})
        //         }
                res
                .json({
                    description: xss(bookmark.description),
                    id: bookmark.id,
                    rating: bookmark.rating,
                    title: xss(bookmark.title),
                    url: xss(bookmark.url)
                })
        //     })
        //     .catch(next)
        //   })
            })
    .delete((req, res, next) => {
        
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)

    })
module.exports = bookmarkRouter