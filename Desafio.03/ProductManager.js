const fs = require('fs/promises');
const path = require('path');

class ProductManager {

    fileProductos;
    #ultimoIdAsignado;

    constructor() {
        this.fileProductos = this.fileProductos = path.join(
            __dirname,
            'productos.json'
        );
        this.#ultimoIdAsignado = 0;
    }

    /**
     * Retorna un array con los productos almacenados en el archivo vinculado a la clase
     */
    async leerArchivo() {
        const rawData = await fs.readFile(this.fileProductos, 'utf-8');
        const productos = JSON.parse(rawData);
        return productos;
    }

    /**
     *
     * @param productos | debe ser un array
     * @returns {Promise<void>}
     */
    async persistirProductos(productos) {
        await fs.writeFile(this.fileProductos, JSON.stringify(productos, null, 2));
    }

    async addProduct(title, description, price, thumbnail, code, stock) {
        try {
            this.validarInputs(title, description, price, thumbnail, code, stock)
        } catch (error) {
            console.log(error);
            return;
        }

        const productos = await this.leerArchivo();

        //  Busco algun producto con el codigo que pasaron por parametro
        const codigoExistente = productos.find((obj) => {
            return obj.code === code;
        });

        if (codigoExistente) {
            throw new Error(`El code "${code}" ya existe`);
        }

        productos.push({
            id: ++this.#ultimoIdAsignado,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        });

        await this.persistirProductos(productos);
    }

    async getProducts() {
        const productos = await this.leerArchivo();
        return productos;
    }

    async getProductById(productId) {
        const productos = await this.leerArchivo();
        const product = productos.find((obj) => {
            return obj.id === productId;
        });
        if (product == null) {
            console.log('Producto no encontrado');
            return null;
        }
        return product;
    }

    async deleteProduct(id) {
        const productosOriginal = await this.leerArchivo();
        const index = productosOriginal.findIndex((obj) => {
            return obj.id === id;
        });
        if (index < 0) {
            console.warn(`El id "${id}" no fue encontrado`);
        } else {
            const productosPurgado = productosOriginal.slice(0, index).concat(productosOriginal.slice(index + 1));
            await this.persistirProductos(productosPurgado);
        }
    }

    /**
     *
     * @param id
     * @param updatedFields | debe ser un objeto
     * @returns {Promise<void>}
     */
    async updateProduct(id, updatedFields) {
        const productos = await this.leerArchivo();
        const index = productos.findIndex((obj) => {
            return obj.id === id;
        });
        if (index < 0) {
            console.warn(`El id "${id}" no fue encontrado`);
        } else {
            productos[index] = {
                ...productos[index],
                ...updatedFields
            };
            await this.persistirProductos(productos);
        }

    }

    validarInputs(title, description, price, thumbnail, code, stock) {
        const errors = [];
        if (title.length < 1) {
            throw new Error('Title debe contener al menos un caracter');
        }
        if (description.length < 1) {
            throw new Error('Description debe contener al menos un caracter');
        }
        if (price <= 0) {
            throw new Error('Price debe contener un valor mayor a cero');
        }
        if (thumbnail.length < 1) {
            throw new Error('Thumbnail debe contener al menos un caracter');
        }
        if (code.length < 1) {
            throw new Error('Code debe contener al menos un caracter');
        }
        if (stock <= 0) {
            throw new Error('Stock debe contener un valor mayor a cero');
        }
    }
}

module.exports = ProductManager;