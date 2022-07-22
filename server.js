// Imports and constants
const express = require('express')
const { Router } = express
const app = express()
const multer = require('multer')

const Container = require('./container')
const container = new Container('productos.json')

const routerProductos = Router()

// Server configuration
const port = 8080

// Static files
app.use('/', express.static('public'))
app.use('/uploads', express.static('uploads'))

// Router config
app.use('/api/productos', routerProductos)
routerProductos.use(express.json())
routerProductos.use(express.urlencoded({ extended: true }))

// Multer config
let storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + Date.now() + file.originalname)
    }
})

let upload = multer({ storage: storage })

// Endpoints
routerProductos.get('/:id', (req, res) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        res.status(400).json({ error: 'id must be a number' })
    } else {
        container.getById(parseInt(id))
            .then(data => { res.json(data) })
            .catch(error => { res.status(500).json(error) })
    }
})

routerProductos.get('/', (req, res) => {
    container.getAll()
        .then(data => { res.json(data) })
        .catch(error => { res.status(500).json(error) })
})

routerProductos.post('/', upload.single('thumbnail'), (req, res) => {
    const thumbnail = req.file
    if (!thumbnail) {
        res.status(400).json({ error: 'missing thumbnail' })
    } else {
        let product = req.body
        product.thumbnail = `/uploads/${thumbnail.filename}`
        if (!product.title || !product.price || !product.thumbnail) {
            res.status(400).json({ error: 'title, price and thumbnail are required' })
        } else {
            product.price = parseFloat(product.price)
            container.save(req.body)
                .then(data => {
                    container.getById(data)
                        .then(prod => { res.json(prod) })
                        .catch(error => { res.status(500).json(error) })
                })
                .catch(error => { res.status(500).json(error) })
        }
    }
})

routerProductos.put('/:id', (req, res) => {
    container.updateById(parseInt(req.params.id), req.body)
        .then(data => { res.json(data) })
        .catch(error => { res.status(500).json(error) })
})

routerProductos.delete('/:id', (req, res) => {
    container.deleteById(parseInt(req.params.id))
        .then(data => { res.json(data) })
        .catch(error => { res.status(500).json(error) })
})

// Server start
const server = app.listen(port, () => {
    console.log(`Server is running on ${server.address().port}`)
})

// Server error
server.on('error', (err) => {
    console.error(`Error: ${err.message}`)
})