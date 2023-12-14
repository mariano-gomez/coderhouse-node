//  It needs axios to work

let productsWithStockEl;
let productsWithoutStockEl;

document.addEventListener("DOMContentLoaded", function() {
    productsWithStockEl = document.querySelector('#stockProducts');
    productsWithoutStockEl = document.querySelector('#outOfStockProducts');
    confirmPurchaseButtonEl = document.querySelector('#confirm-purchase');
    fetchCartContent('/api/carts/' + cartId + '/availability');
});

function fetchCartContent(link) {
    axios.get(link)
        .then(function (response) {
            if (response.status == 200) {
                renderProductsList(response.data.available, productsWithStockEl);
                renderProductsList(response.data.unavailable, productsWithoutStockEl);
            } else {
                return Promise.reject(response.data.message);
            }
        })
        .catch(function (error) {
            console.error("Error en la solicitud:", error);
        });
}

//  It renders the product list, cleaning the old one, and adding one card for each product in the argument
function renderProductsList(productsList, productsEl) {
    productsEl.innerHTML = '';
    if (productsList.length) {
        for (const product of productsList) {
            productsEl.innerHTML += `
                <div>
                    <div class="uk-card uk-card-default">
                        <div class="uk-card-body">
                            <h3 class="uk-card-title">${product.title}</h3>
                            <h5>Unidades cargadas: ${product.in_cart}</h5>
                            <h5>Unidades Disponibles: ${product.in_stock}</h5>
                            <button class="uk-button uk-button-secondary uk-button-small">
                                <a href="/cart/${cartId}/product/${product.id}/delete">
                                    Eliminar
                                </a>
                            </button>
                        </div>
                    </div>
                </div>`;
        }
        confirmPurchaseButtonEl.style.display = 'block';
    } else {
        productsEl.innerHTML += `<h1>No hay productos en esta seccion</h1>`;
        confirmPurchaseButtonEl.style.display = 'hidden';
    }
}

function confirmPurchase() {
    axios.put(`/api/carts/${cartId}/purchase`)
        .then(function (response) {
            if (response.status == 200) {
                window.location.href = response.data.payload;
            } else {
                return Promise.reject(response.data.message);
            }
        })
        .catch(function (error) {
            console.error("Error en la solicitud:", error);
        });
}