const express = require('express')
// const { v4: uuid } = require('uuid')
const xss = require('xss')
const BookmarksService = require('../bookmarks-service')
const logger = require('../logger')
const bodyParser = express.json()
const bookmarkRouter = express.Router()
const jsonParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {

    const { title, url, description, rating } = req.body

    const newBookmark = {
        // id,
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
        .json(bookmark)
})
    .catch(next)
})

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => {
        const bookmark_id = req.params.id
        const knexInstance = req.app.get('db')
        BookmarksService.getById(knexInstance, bookmark_id)
            .then(bookmark => {
                if(!bookmark) {
                    return res.status(404).json({error: { message: `Bookmark doesn't exist`}})
                }
                res
                .json({
                    description: xss(bookmark.description),
                    id: bookmark.id,
                    rating: bookmark.rating,
                    title: xss(bookmark.title),
                    url: xss(bookmark.url)
                })
            })
            .catch(next)
          })
    .delete((req, res) => {
        const { id } = req.params;
  
        const bookmarkIndex = bookmarks.findIndex(bi => bi.id == id);
      
        if (bookmarkIndex === -1) {
          logger.error(`Bookmark with id ${id} not found.`);
          return res
            .status(404)
            .send('Not Found');
        }
      
        bookmarks.splice(bookmarkIndex, 1);
      
        logger.info(`Bookmark with id ${id} deleted.`);
        res
          .status(204)
          .end();    
    })

module.exports = bookmarkRouter