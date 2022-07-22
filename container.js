const fs = require('fs');

module.exports = class Container {
  constructor(filename) {
    this.filename = './data/' + filename
  }

  // Se agrega un producto... Si no existe el archivo, se crea... Si existe, se agrega al array... Se retorna el id del producto...
  save = async (product) => {
    try {
      let products = await this.getAll()
        .then(products => { return products })
        .catch(error => { return error })
      // Se usa reduce para determinar el mayor id... Y se le suma 1 para que sea el nuevo id...
      if (products.length === 0) {
        product.id = 1
      } else {
        product.id = products.reduce((max, prd) => { return prd.id > max ? prd.id : max }, 0) + 1
      }
      products.push(product)
      await fs.promises.writeFile(this.filename, JSON.stringify(products))
      return product.id
    } catch (error) {
      console.error(error)
    }
  }

  // Se obtienen todos los productos...
  getAll = async () => {
    try {
        const products = await fs.promises.readFile(this.filename, 'utf8')
        if (products) {
          return JSON.parse(products)
        } else {
          // Si no hay productos, se crea un array vacio...
          return []
        }
    } catch (error) {
      switch (error.code) {
        case 'ENOENT':
          // Si no existe el archivo, se devuelve un array vacío...
          return []
        default:
          console.error(error)
          break
      }
    }
  }

  // Se obtiene el producto con id...
  getById = async (id) => {
    try {
        const product = await this.getAll()
          .then(products => { return products.filter(obj => obj.id === id)})
        if (product.length > 0) {
          return product[0]
        } else {
          return { error: 'product not found' }
        }
    } catch (error) {
      console.error(error)
    }
  }

  // Se actualiza el producto con id...
  updateById = async (id, product) => {
    product.id = id
    try {
        const result = await this.getAll()
          .then(products => {
            const index = products.findIndex(obj => obj.id === id)
            if (index !== -1) {
              products[index] = product
              fs.promises.writeFile(this.filename, JSON.stringify(products))
              return {success: 'product updated'}
            } else {
              return {error: 'product not found'}
            }
          })
        return result
    } catch (error) {
      console.error(error)
    }
  }

  // Se elimina el producto con id...
  deleteById = async (id) => {
    try {
      const result = await this.getAll().then(data => {
        const length = data.length
        const filtered = data.filter(obj => obj.id !== id)
        if (length === filtered.length) {
          return {error: 'product not found'}
        } else {
          fs.promises.writeFile(this.filename, JSON.stringify(filtered))
          return {success: 'product deleted'}
        }
      })
      return result
    } catch (error) {
      console.error(error)
    }
  }

  // Se eliminan todos los productos...
  deleteAll = async () => {
    try {
        await fs.promises.writeFile(this.filename, '[]')
    } catch (error) {
      console.error(error)
    }
  }

}