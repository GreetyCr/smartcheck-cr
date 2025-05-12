/**
 * Script para descargar imágenes de muestra para el blog
 * 
 * Este script debe ejecutarse con Node.js
 * Comando: node src/scripts/download-blog-images.js
 */

import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurarse de que existe el directorio de imágenes
const imageDir = path.join(process.cwd(), 'public', 'images', 'blog');

if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
  console.log(`✅ Directorio creado: ${imageDir}`);
}

// Listado de imágenes para descargar con sus URLs de fuentes libres
const imagesToDownload = [
  {
    filename: 'inspeccion-carro-usado.jpg',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop'
  },
  {
    filename: 'documentacion-legal-vehiculos.jpg',
    url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop'
  },
  {
    filename: 'mantenimiento-preventivo.jpg',
    url: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&auto=format&fit=crop'
  },
  {
    filename: 'herramientas-diagnostico.jpg',
    url: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?w=800&auto=format&fit=crop'
  },
  {
    filename: 'escaner-obd2.jpg',
    url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop'
  },
  {
    filename: 'software-diagnostico.jpg',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop'
  },
  {
    filename: 'analizador-bateria.jpg',
    url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop'
  },
  {
    filename: 'seguro-vehicular.jpg',
    url: 'https://images.unsplash.com/photo-1450609283058-0ec52fa7eac4?w=800&auto=format&fit=crop'
  }
];

// Función para descargar una imagen
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Error al descargar la imagen: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });

      fileStream.on('error', err => {
        fs.unlink(filepath, () => {}); // Eliminar el archivo parcial
        reject(err);
      });
    }).on('error', err => {
      reject(err);
    });
  });
}

// Descargar las imágenes
async function downloadAllImages() {
  console.log('Iniciando descarga de imágenes para el blog...');
  
  for (const image of imagesToDownload) {
    const filepath = path.join(imageDir, image.filename);
    
    // Si la imagen ya existe, verificamos si debemos reemplazarla
    if (fs.existsSync(filepath)) {
      console.log(`⚠️ La imagen ${image.filename} ya existe, omitiendo...`);
      continue;
    }
    
    try {
      await downloadImage(image.url, filepath);
      console.log(`✅ Descargada: ${image.filename}`);
    } catch (error) {
      console.error(`❌ Error descargando ${image.filename}:`, error.message);
    }
  }
  
  console.log('Proceso de descarga finalizado');
}

// Ejecutar el script
downloadAllImages(); 