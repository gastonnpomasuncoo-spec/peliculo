# 🎬 Peliculo :V — Tu Mesa de Luz Cinéfila

Aplicación web desarrollada con **React + Vite**, conectada en tiempo real a **Firebase (Authentication y Cloud Firestore)** y a la API de **TMDB**, desplegada en **Vercel** para la materia *Desarrollo Frontend II* (UADE).

- **URL en producción (Vercel):** [https://peliculo.vercel.app/](https://peliculo.vercel.app/)
- **Repositorio en GitHub:** [https://github.com/gastonnpomasuncoo-spec/peliculo](https://github.com/gastonnpomasuncoo-spec/peliculo)

---

## 📌 Propuesta y problema que resuelve

**Peliculo** ataca la parálisis por análisis y la procrastinación cinéfila (acumular cientos de películas en listas de "Ver más tarde" que nunca se terminan).

En lugar de una lista infinita, la aplicación implementa la mecánica de **"La Mesa de Luz"**:
1. **Mesa de Luz (Máximo 3 películas en foco):** El usuario solo visualiza hasta 3 películas activas para elegir qué ver hoy.
2. **Cajón Oculto (En espera):** Si guarda más de 3 películas desde el catálogo de *Descubrir*, se almacenan automáticamente en un cajón oculto para no generar ruido visual. Para desbloquear la siguiente película en espera, el usuario debe marcar una de su Mesa de Luz como **Vista** o **Desecharla**.
3. **Objetivos y Escala de Niveles:** Incluye un **Objetivo Anual Inicial de 50 películas** editable, la posibilidad de sumar múltiples metas personalizadas por plazo (1 a 12 meses) y una escala general de 5 rangos con marcos dinámicos en el perfil (*Pichi*, *Medio pichi*, *Capo*, *Tipazo* y *The King / La Cabra*).

---

## 🛠️ Tecnologías utilizadas

- **Frontend:** React 18 + Vite (JavaScript ES6 modular)
- **Estilos:** CSS3 personalizado (Paleta `#26262D`, `#121015`, `#F4F4F4`, `#EAB308` y tipografías *Bebas Neue* + *Montserrat*)
- **Base de datos y Autenticación (Serverless):** Firebase Authentication (Anónimo y Correo/Contraseña) + Cloud Firestore
- **Catálogo externo:** The Movie Database (TMDB) API

---

## 🚀 Instrucciones para instalar y ejecutar el proyecto localmente

### 1. Clonar el repositorio e instalar dependencias
Al descargar el proyecto desde GitHub, la carpeta `node_modules/` no está incluida. Para reconstruir las librerías necesarias, abrir una terminal en la carpeta del proyecto y ejecutar:

```bash
npm install