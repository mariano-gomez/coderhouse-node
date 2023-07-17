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
    - `data/` contiene los archivos de persistencia, hasta que se implemente una integración con una base de datos
    - `managers/` contiene las clases que tienen la responsabilidad de gestionar las persistencias (CRUDs/ABMs)
    - `middlewares/` se optó por realizar las validaciones de los inputs mediante middlewares específicos para cada endpoint
    - `public/` archivos css y javascript
    - `routes/` contiene los manejadores para todas las rutas contempladas del proyecto
    - `views/` plantillas handlebars
    - `websockets/` codigo vinculado al comportamiento del server con websockets
    - `app.js` el archivo principal del proyecto

## Endpoints

  - `products`
    - `[GET] /api/products` Obtiene el listado de todos los productos en el sistema. Opcionalmente se puede agregar un parametro `?limit=N` para ver los primeros `N` productos almacenados en el sistema
    - `[GET] /api/products/:pid` Si existe, muestra la información del producto especificado
    - `[POST] /api/products` Crea un nuevo producto
    - `[PUT] /api/products/:pid` Edita el producto especificado
    - `[delete] /api/products/:pid` Elimina de la persistencia el producto especificado
  - `carts`
    - `[GET] /api/carts/:cid` Obtiene el contenido (ids de productos y cantidad de cada uno) del carrito especificado
    - `[POST] /api/carts` Crea un nuevo carrito vacío
    - `[POST] /api/carts/:cid/product/:pid` Si el producto no existe en el carrito, lo agrega con una cantidad de 1 unidad. Si ya estaba cargado en el carrito, aumenta su cantidad en 1 unidad

## Urls
  - `[GET] /` Pagina "home", que muestra el listado de productos existentes hasta el momento 
  - `[GET] /realtimeproducts` Pagina "home", que muestra el listado de productos existentes hasta el momento en tiempo real (utilizando websockets) 
