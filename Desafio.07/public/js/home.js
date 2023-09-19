//  It needs axios to work

let productsEl;

document.addEventListener("DOMContentLoaded", function() {
    productsEl = document.querySelector('#products');

    let currentUrl = window.location.href;
    if (currentUrl.indexOf('?') == -1) {
        currentUrl += '?';
    }
    fetchPage(currentUrl.replace('?', 'api/products/?'));
});


function fetchPage(link) {
    axios.get(link)
        .then(function (response) {
            if (response.data.status == 'success') {
                renderProductsList(response.data.payload);
                showNavigationLinks(response.data);
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
                        <p>${product.description }</p>
                        <form method="post" action="/cart/${cartId}/product/${product.id}/add">
                            <button type="submit" class="uk-button uk-button-secondary uk-button-small">
                                Agregar al carrito
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
}

function showNavigationLinks(paginationResponse) {
    const prevPageLink = document.querySelector('#prevPage');
    const nextPageLink = document.querySelector('#nextPage');

    prevPageLink.style.display = (paginationResponse.prevLink ? 'block' : 'none');
    nextPageLink.style.display = (paginationResponse.nextLink ? 'block' : 'none');

    if (paginationResponse.hasPrevPage) {
        prevPageLink
            .setAttribute('href', paginationResponse.prevLink.replace('/api/products', ''));
    }
    if (paginationResponse.hasNextPage) {
        nextPageLink
            .setAttribute('href', paginationResponse.nextLink.replace('/api/products', ''));
    }
}