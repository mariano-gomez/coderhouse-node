const socket = io();

const productsEl = document.querySelector('#products');

const socketBehavior = {
    enableSocketBehavior() {
        socketBehavior.fetchAllProducts();
        socketBehavior.listenProductsList();
    },

    fetchAllProducts() {
        console.log('requesting products data');
        socket.emit('products.list.request', null);
    },

    listenProductsList() {
        socket.on('products.list.updated', (products) => {
            console.log('receiving data...');
            renderProductsList(products);
        });
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
                        ${renderProductKeywords(product)}
                        <p>${product.description }</p>
                        <button onclick="addToCart(${product.id})" class="uk-button uk-button-secondary uk-button-small">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        `;
    }
    console.log('products list updated');
}

function renderProductKeywords(product) {
    html = '';
    if (product.keywords) {
        for (const keyword of product.keywords) {
            html += `
                <span class="uk-badge">${keyword}</span>
            `;
        }
    }
    return html;
}

socketBehavior.enableSocketBehavior();