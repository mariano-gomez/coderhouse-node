//  It needs axios to work

let productsEl;

document.addEventListener("DOMContentLoaded", function() {
    productsEl = document.querySelector('#users');

    const currentUrl = window.location.href;
    fetchPage(currentUrl.replace('admin/users', 'api/users'));
});


function fetchPage(link) {
    axios.get(link)
        .then(function (response) {
            if (response.data.status == 'success') {
                renderUsersList(response.data.payload);
            } else {
                return Promise.reject(response.data.message);
            }
        })
        .catch(function (error) {
            console.error("Error en la solicitud:", error);
        });
}

function renderUsersList(usersList) {
    productsEl.innerHTML = '';
    for (const user of usersList) {
        productsEl.innerHTML += `
            <div>
                <div class="uk-card uk-card-default">
                    <div class="uk-card-media-top">
                        <img alt="foto producto" />
                    </div>
                    <div class="uk-card-body">
                        <h3 class="uk-card-title">${user.first_name} ${user.last_name}</h3>
                        <h5>${user.email}</h5>
                        <p>
                            <select name="role" onchange="changeRole(this, '${user.id}')" data-current="${user.role}">
                                <option value="admin" ${(user.role == 'admin' ? 'selected' : '')}>Administrador</option>
                                <option value="premium" ${(user.role == 'premium' ? 'selected' : '')}>Premium</option>
                                <option value="user" ${(user.role == 'user' ? 'selected' : '')}>User</option>
                            </select>
                        </p>
                        <br>
                        <button type="button" onclick="removeUser(this, '${user.id}')" class="uk-button uk-button-secondary uk-button-small">
                            Eliminar Usuario
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

function removeUser(buttonElement, userId) {
    axios.delete('/api/users/' + userId)
        .then(function (response) {
            if (response.status == 204) {
                alert(`usuario eliminado`);
                buttonElement.closest('.uk-card').parentNode.remove();
            } else {

            }
        })
        .catch(function (error) {
            alert(`Error en la peticion, no pudo borrarse el usuario`);
            console.error("Error en la solicitud:", error);
        });
}

function changeRole(dropdownElement, userId) {
    const originalValue = dropdownElement.getAttribute('data-current');
    axios.put('/api/users/' + userId + '/changeRole', {
        role: dropdownElement.value
    })
        .then(function (response) {
            alert(`Rol cambiado con éxito!`);
        })
        .catch(function (axiosResponse) {
            alert(`Error en la peticion:\n ${axiosResponse.response.data.error}`);
            dropdownElement.value = originalValue;
            console.error("Error en la solicitud:", error);
        });
}