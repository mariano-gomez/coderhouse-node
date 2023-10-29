//  It needs axios to work

let productsEl;

document.addEventListener("DOMContentLoaded", function() {
    productsEl = document.querySelector('#products');
    fetchCartContent('/api/carts/' + cartId);
});

function fetchCartContent(link) {
    axios.get(link)
        .then(function (response) {
            if (response.status == 200) {
                renderProductsList(response.data);
            } else {
                return Promise.reject(response.data.message);
            }
        })
        .catch(function (error) {
            console.error("Error en la solicitud:", error);
        });
}

//  It renders the product list, cleaning the old one, and adding one card for each product in the argument
function renderProductsList(productsList) {
    productsEl.innerHTML = '';
    if (productsList.length) {
        for (const product of productsList) {
            productsEl.innerHTML += `
                <div>
                    <div class="uk-card uk-card-default">
                        <div class="uk-card-media-top">
                            <img alt="foto producto" />
                        </div>
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">${product.product.title}</h3>
                            <h5>USD $ ${product.product.price}</h5>
                            <p>${product.product.description}</p>
                            <h5>Unidades cargadas: ${product.quantity}</h5>
                            <button class="uk-button uk-button-secondary uk-button-small">
                                <a href="/cart/${cartId}/product/${product.product._id}/delete">
                                    Eliminar
                                </a>
                            </button>
                        </div>
                    </div>
                </div>`;
        }
    } else {
        productsEl.innerHTML += `<h1>No hay productos cargados en este carrito</h1>`;
    }
}