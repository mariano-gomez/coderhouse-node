const socket = io();

const productsEl = document.querySelector('#products');

const socketBehavior = {
    enableSocketBehavior() {
        socket.emit('handshake', null, (response) => {
            console.log('cliente conectado');

            //  once the connection is confirmed, i can start sending and receiving data
            socketBehavior.listenSocketEvents();
            socketBehavior.fetchAllProducts();
        });
    },

    fetchAllProducts() {
        console.log('requesting products data');
        socket.emit('products.list.request', null);
    },

    listenSocketEvents() {
        socket.on('products.list.updated', (products) => {
            console.log('receiving data...');
            renderProductsList(products);
        });

        socket.on('products.delete.error', (error) => {
            alert(error);
        });

        socket.on('products.create.error', (error) => {
            alert(error);
        });
    },

    createProduct() {
        const formEl = document.querySelector('#productForm');
        const title = formEl.querySelector('#title').value;
        const price = formEl.querySelector('#price').value;
        const description = formEl.querySelector('#description').value;
        const code = formEl.querySelector('#code').value;
        const stock = formEl.querySelector('#stock').value;
        const category = formEl.querySelector('#category').value;
        const status = formEl.querySelector('#status').value == true;
        socket.emit('product.create', { title, price, description, code, stock, category, status });

        formEl.querySelector('#title').value = '';
        formEl.querySelector('#price').value = '';
        formEl.querySelector('#description').value = '';
        formEl.querySelector('#code').value = '';
        formEl.querySelector('#stock').value = '';
        if (formEl.querySelector('#category').type != 'hidden') {
            formEl.querySelector('#category').value = '';
        }
        if (formEl.querySelector('#status').type != 'hidden') {
            formEl.querySelector('#status').value = '';
        }
    },

    deleteProduct(productId) {
        socket.emit('product.delete.request', productId);
    }
};

//  It renders the product list, cleaning the old one, and adding one card for each product added in the
//  `products.json` file, in the server
function renderProductsList(productsList) {
    productsEl.innerHTML = '';
    for (const product of productsList) {
        productsEl.innerHTML += `
            <div>
                <div class="uk-card uk-card-default">
                    <div class="uk-card-media-top">
                        <img alt="foto producto" />
                    </div>
                    <div class="uk-card-body">
                        <h3 class="uk-card-title">${product.title}</h3>
                        <h5>USD ${product.price}</h5>
                        ${renderProductKeywords(product.keywords)}
                        <p>${product.description }</p>
                        <button onclick="socketBehavior.deleteProduct('${product._id}')" class="uk-button uk-button-secondary uk-button-small">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderProductKeywords(keywords) {
    html = '';
    if (keywords) {
        for (const keyword of keywords) {
            html += `
                <span class="uk-badge">${keyword}</span>
            `;
        }
    }
    return html;
}

socketBehavior.enableSocketBehavior();