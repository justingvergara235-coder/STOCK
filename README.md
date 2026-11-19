# StockFlow

Aplicación web de gestión de inventario con interfaz SaaS oscura, navegación lateral y acentos verdes.

## Ejecutar
Abre `index.html` en un navegador moderno. No requiere instalación ni servidor para el uso local.

## Publicar con GitHub Pages
1. Crea un repositorio llamado `STOCKFLOW`.
2. Sube el contenido de esta carpeta a la raíz del repositorio (no subas la carpeta contenedora como una subcarpeta).
3. Ve a **Settings → Pages**.
4. Selecciona **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
5. Guarda y espera la publicación.

## Funciones
- Dashboard con indicadores de inventario y alertas.
- Productos: crear, editar, activar/desactivar, eliminar, buscar y filtrar.
- Imágenes locales por producto con vista previa.
- Categorías: crear, renombrar y eliminar (si no tienen productos asociados).
- Movimientos: entradas, salidas y ajustes con validación de existencias.
- Reportes por categoría y exportación CSV.
- Copias de seguridad JSON e importación/restauración.
- Persistencia en `localStorage`.

## Alcance
Los datos se almacenan en el navegador y equipo donde se utiliza la aplicación. GitHub Pages publica los archivos estáticos; no sincroniza datos entre usuarios o dispositivos. Para uso multiusuario se requiere backend y base de datos.
