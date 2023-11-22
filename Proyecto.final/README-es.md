# Proyecto integrador curso backend

Este proyecto forma parte de una serie de iteraciones vinculadas al proyecto final de un curso.

## Instalación

Los pasos para instalar el proyecto son los siguientes:
- Descargar el repositorio, utilizando `git clone https://github.com/mariano-gomez/coderhouse-node.git`
- Ingresar a la carpeta de la entrega que se quiere analizar
- Instalar las dependencias, ejecutando `npm install`, o `npm i`
- Crear, al menos, un archivo `.env.production` con valores para las distintas variables de entorno. Se recomienda usar el archivo `.env` como guia, ya que si falta alguna de esas variables, el servidor no podrá funcionar (también puede crearse otro archivo `.env.development`)
## Uso

Para utilizar el proyecto, hay que lanzar el servidor. Para esto, hay que ejecutar
```shell
node app.js [--env <production|development>] --persist <file|mongo>
```
donde `--env` especifica el archivo `.env` que se va a utilizar (`.env.production` o `.env.development`), y `--persist` se refiere al tipo de persistencia que se utilizará para almacenar productos y carritos (`mongo` para mongoDB, `file` para archivos json ubicados en `/data`)

Atajos para ejecutar el server:
```shell
npm run start:<env>
```
`<env>` puede ser `prod` (requiere que exista un archivo `.env.production`) o `dev` (requiere que exista un archivo `.env.development`).
Si se omite el environment, intentará iniciar en modo `production` por defecto
Ejecutar `npm start` es el equivalente a ejecutar `npm run start:prod` 

## Características

- La estructura del proyecto es la siguiente:
    - `config/` contiene archivos de configuración (estrategias de passport, variables de configuración globales)
    - `controllers/` El codigo que procesa las peticiones. Su contenido debe(ría) ser llamado desde la capa de routers
    - `dao/` contiene archivos de persistencia, necesarios hasta la implementación de persistencia en base de datos
        - `db/` contiene los managers que interactuan con la DB, a traves de los schemas/modelos definidos para tal fin
        - `filesystem/` contiene las clases que tienen la responsabilidad de gestionar las persistencias (CRUDs/ABMs) en los archivos ubicados en `/data`
        - `models/` contiene las especificaciones, para utilizar con mongoose, de los documentos donde se va a persistir la información
        - `factory.dao.js` en base al tipo de persistencia elegida por consola, devuelve los managers para dicho tipo de persistencia
    - `[deprecated] data/` contiene archivos de persistencia, necesarios hasta la implementación de persistencia en base de datos
    - `middlewares/` código que valida inputs específicos para cada endpoint
        - `auth/` middlewares para validar que el usuario esté autenticado
        - `socket.middleware/` middlewares para validar los inputs que llegan mediante el socket
    - `public/` archivos css y javascript
    - `routes/` contiene los manejadores para todas las rutas contempladas del proyecto
    - `scripts/` contiene scripts que eventualmente pueden facilitar la tarea de rellenar la DB con información
    - `services/` contiene clases de servicios que pueden ser requeridos en distintos controllers (envio de mensajes, renderizado de correos, cierre de compras)
    - `storage/` aquí se van a almacenar los documentos e imágenes que suban los usuarios.
    - `swagger/` aquí se ubican los archivos con la especificacion de los endpoints, para poder documentarlos con swagger
    - `test/` aquí se encuentran los archivos para la ejecución de pruebas de integración/unitarias
    - `utils/` código complementario que puede ser requerido en distintas partes del sistema
    - `views/` plantillas handlebars
    - `websockets/` código vinculado al comportamiento del server con websockets
    - `app.js` el archivo principal del proyecto
    - `dependency.injection.js` la idea de este archivo es centralizar las referencias a distintos recursos o servicios, para poder accederlos de forma facil desde cualquier lugar del sistema
    - `.env.production | .env.development` archivo con las variables de entorno requeridas para que el servidor funcione (leer más en la sección "Uso")

## Endpoints
- `products`
    - `[GET] /api/products` Obtiene el listado de todos los productos en el sistema. Opcionalmente se puede agregar un parámetro `?limit=N` para ver los primeros `N` productos almacenados en el sistema
    - `[GET] /api/products/:pid` Si existe, muestra la información del producto especificado
    - `[POST] /api/products` Crea un nuevo producto
    - `[PUT] /api/products/:pid` Edita el producto especificado
    - `[DELETE] /api/products/:pid` Elimina de la persistencia el producto especificado
- `carts`
    - `[GET] /api/carts/:cid` Obtiene el contenido (ids de productos y cantidad de cada uno) del carrito especificado
    - `[POST] /api/carts` Crea un nuevo carrito vacío
    - `[POST] /api/carts/:cid/product/:pid` Si el producto no existe en el carrito, lo agrega con una cantidad de 1 unidad. Si ya estaba cargado en el carrito, aumenta su cantidad en 1 unidad
    - `[DELETE] /api/carts/:cid/product/:pid` Elimina el producto con id `:pid` del carrito con id `:cid`
    - `[DELETE] /api/carts/:cid` Elimina todos los productos del carrito con id `:cid`
    - `[PUT] /api/carts/:cid/products/:pid` Ajusta la cantidad de productos con id `:pid` en el carrito con id `:cid`
    - `[PUT] /api/carts/:cid` Elimina todo el contenido anterior del carrito con id `:cid` y lo reemplaza por el contenido de la peticion
    - `[PUT] /api/carts/:cid/purchase` Genera un ticket con los productos que están en el carrito, y cuyo stock en catálogo es suficiente para cubrir los que se agregaron al carrito. Los productos sin suficiente stock, permanecen en el carrito. El cuerpo del request puede estar vacío
- `users`
    - `[GET] /api/users/current` si hay un usuario logueado, muestra la información del usuario con sesión abierta
    - `[PUT] /api/users/premium/:uid` intercambia el rol del usuario entre `user` y `premium` (siempre y cuando el usuario `:uid` no sea `admin`), debe tener subidos los documentos obligatorios en su perfil (ver endpoint `/api/users/:uid/documents`)
    - `[PUT] /api/users/:uid/documents` Permite subir documentos e imagenes al usuario con `:uid`. Los nombres de los campos son:
      - `accountState`: Comprobante de estado de cuenta (sólo se guarda la última versión subida del archivo)
      - `address`: Comprobante de domicilio (sólo se guarda la última versión subida del archivo)
      - `id`: Identificación del usuario (sólo se guarda la última versión subida del archivo)
      - `products`: Imágenes de productos. Se acumulan a medida que se suben
      - `others`: Cualquier otro tipo de documentos. Se acumulan a medida que se suben
    - `[DELETE] /api/users/:uid` si existe, elimina el usuario con `:uid` (sólo puede borrarse con un usuario `admin`)
    - `[DELETE] /api/users` Elimina todos los usuarios que no han tenido actividad en los úlitmos 2 días

## Urls
- `[GET] /` Página "home", que muestra el listado de productos existentes hasta el momento
- `[GET] /realtimeproducts` Página "home", que muestra el listado de productos existentes hasta el momento en tiempo real (utilizando websockets)
- `[GET] /chat` Página desde donde se podra ingresar a un chat basico, utilizando websockets para materializar la funcionalidad
- `[GET] /github` Enlace para loguearse a través de una cuenta de GitHub
- `[GET] /login` Página desde donde loguearse con un usuario preexistente en la DB
- `[POST] /login` Envio de las credenciales de login para autenticarse
- `[GET] /signup` Página para registrar un nuevo usuario
- `[POST] /signup` Envio de los datos del nuevo usuario que se quiere crear
- `[GET] /profile` Página para ver la información en el sistema del usuario logueado actualmente (redirecciona si no hay usuario logueado)
- `[GET] /logout` Enlace para cerrar sesión. Debe redireccionar a `/login`
- `[GET] /cart/:id` Página para ver los productos cargados en el carrito del usuario logueado actualmente (redirecciona si no hay usuario logueado)
- `[GET] /mockingproducts` Devuelve un listado de productos generados aleatoriamente con la libreria faker (100 por defecto, se puede alterar este numero agregando un argumento `quantity=<numero>` al queryString)
- `[GET] /loggerTest` Genera una línea de log por cada tipo de nivel configurado en el sistema
- `[GET] /swaggerdocs` Permite ver la documentacion autogenerada por swagger relativa a los endpoints y rutas vinculadas a los carritos y a los productos

## Tests

Para correr el script de pruebas, hay que lanzar el servidor desde una terminal, y desde otra ejecutar lo siguiente:
```shell
npm run test
```