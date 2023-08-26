# Proyecto integrador curso backend

Este proyecto forma parte de una serie de iteraciones vinculadas al proyecto final de un curso.

## Instalación

Los pasos para instalar el proyecto son los siguientes:
- Descargar el repositorio, utilizando `git clone https://github.com/mariano-gomez/coderhouse-node.git`
- ingresar a la carpeta del proyecto, y luego a la carpeta `Proyecto.final`
- Instalar las dependencias, ejecutando `npm install`, o `npm i`

## Uso

Para utilizar el proyecto, hay que lanzar el servidor. Para esto, hay que ejecutar

```shell
npm start
```

## Características

- La estructura del proyecto es la siguiente:
    - `dao/` contiene archivos de persistencia, necesarios hasta la implementacion de persistencia en base de datos
      - `db/` contiene los managers que interactuan con la DB, a traves de los schemas/modelos definidos para tal fin
      - `[deprecated] filesystem/` contiene las clases que tienen la responsabilidad de gestionar las persistencias (CRUDs/ABMs) en los archivos ubicados en `/data` (deprecated) 
      - `models/` contiene las especificaciones, para utilizar con mongoose, de los documentos donde se va a persistir la informacion 
    - `[deprecated] data/` contiene archivos de persistencia, necesarios hasta la implementacion de persistencia en base de datos
    - `middlewares/` se optó por realizar las validaciones de los inputs mediante middlewares específicos para cada endpoint
    - `public/` archivos css y javascript
    - `scripts/` contiene scripts que eventualmente pueden facilitar la tarea de rellenar la DB con informacion
    - `routes/` contiene los manejadores para todas las rutas contempladas del proyecto
    - `scripts/` contiene un script para "sembrar" de datos la tabla de productos
    - `views/` plantillas handlebars
    - `websockets/` codigo vinculado al comportamiento del server con websockets
    - `app.js` el archivo principal del proyecto
    - `dependency.injection.js` la idea de este archivo es centralizar las referencias a distintos recursos o servicios, para poder accederlos de forma facil desde cualquier lugar del sistema

## Endpoints

  - `products`
    - `[GET] /api/products` Obtiene el listado de todos los productos en el sistema. Opcionalmente se puede agregar un parametro `?limit=N` para ver los primeros `N` productos almacenados en el sistema
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

## Urls
  - `[GET] /` Pagina "home", que muestra el listado de productos existentes hasta el momento 
  - `[GET] /realtimeproducts` Pagina "home", que muestra el listado de productos existentes hasta el momento en tiempo real (utilizando websockets) 
  - `[GET] /chat` Pagina desde donde se podra ingresar a un chat basico, utilizando websockets para materializar la funcionalidad 
  - `[GET] /login` Pagina desde donde loguearse con un usuario preexistente en la DB 
  - `[POST] /login` Envio de las credenciales de login para autenticarse 
  - `[GET] /signup` Pagina para registrar un nuevo usuario 
  - `[POST] /signup` Envio de los datos del nuevo usuario que se quiere crear 
  - `[GET] /profile` Pagina para ver la informacion en el sistema del usuario logueado actualmente (redirecciona si no hay usuario logueado) 
  - `[GET] /logout` Enlace para cerrar sesion. Debe redireccionar a `/login` 
  - `[GET] /cart/:id` Pagina para ver los productos cargados en el carrito del usuario logueado actualmente (redirecciona si no hay usuario logueado)
