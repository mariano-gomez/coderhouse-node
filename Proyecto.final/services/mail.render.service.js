const dependencyContainer = require('../dependency.injection');
const _dotenv = dependencyContainer.get('dotenv');

class MailRenderService {

    static renderRestorePassword(hash) {
        return `Para actualizar tu contraseña, hacé click en el siguiente enlace:<br/>
            <button>
                <a href="${_dotenv.SITE_URL}/new-password/?id=${hash}"> Cambiar contraseña</a>
            </button>
        `;
    }

    static renderTicket(ticketData) {
        return `
            <h2>Compra recibida!</h2>
            <ul>
                <li><strong>Código:</strong> ${ticketData.code}</li>
            </ul>
            <table>
                <tr>
                    <td>Producto</td>
                    <td>Cantidad</td>
                    <td>Precio unit.</td>
                    <td>Subtotal</td>
                </tr>
                ${MailRenderService.#ticketProductRows(ticketData.products)}
                <tr>
                    <td colspan="3"><strong>TOTAL</strong></td>
                    <td>$ ${ticketData.amount}</td>
                </tr>
            </table>
        `;
    }

    static renderUserDeletedNotification(user) {
        return `
            <h2>Cuenta eliminada</h2>
            <p>
                Hola ${user.first_name}!<br>
                Lamentamos tener que comunicarnos contigo, porque hace más de dos días que no te vemos conectado.
                Pero ey! Siempre podés volver a registrarte! Aunque, en caso que tuvieras productos en el carrito, 
                deberás volver a agregarlos.
            </p>
        `;
    }

    static #ticketProductRows(products) {
        let html = ``;
        for (let product of products) {
            html += `
                <tr>
                    <td>${ product.title }</td>
                    <td>${ product.quantity }</td>
                    <td>$ ${ product.unit_price }</td>
                    <td>$ ${ product.subtotal }</td>
                </tr>`;
        }
        return html;
    }
}

module.exports = MailRenderService;