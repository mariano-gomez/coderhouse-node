
class MailRenderService {

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