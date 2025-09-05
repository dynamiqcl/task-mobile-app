# 📱 Task Manager Mobile App

Una aplicación móvil desarrollada con React Native y Expo para la gestión de tareas empresariales.

## 🚀 Características

- **Autenticación de usuarios** con login/logout seguro
- **Gestión de tareas** con estados y prioridades
- **Sistema de notificaciones** push en tiempo real
- **Carga de evidencias** con cámara y galería
- **Filtrado por usuario** para ver solo tareas asignadas
- **Interfaz intuitiva** con navegación por tabs
- **Modo offline** con sincronización automática

## 📋 Pantallas

- 🔐 **Login** - Autenticación de usuarios
- 📝 **Lista de Tareas** - Vista de tareas asignadas al usuario
- 📄 **Detalle de Tarea** - Información completa y gestión de evidencias
- 🔔 **Notificaciones** - Centro de notificaciones en tiempo real
- 👤 **Perfil** - Información del usuario y configuración

## 🛠️ Tecnologías

- **React Native** con Expo
- **TypeScript** para tipado estático
- **React Navigation** para navegación
- **Expo Notifications** para push notifications
- **AsyncStorage** para persistencia local
- **Expo Camera/ImagePicker** para captura de evidencias

## 🏃‍♂️ Inicio Rápido

### Prerequisitos
- Node.js 16+
- Expo CLI
- Simulador iOS/Android o dispositivo físico

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/task-mobile-app.git

# Navegar al directorio
cd task-mobile-app

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

### Credenciales de Demo

Para probar la aplicación, puedes usar estas credenciales:

- **Usuario**: `ana.martinez` | **Contraseña**: `ana123`
- **Usuario**: `demo` | **Contraseña**: `demo`

## 🔧 Configuración

### Backend API

La aplicación se conecta a un backend REST API. Configura la URL en `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://192.168.7.177:3000/api';
```

### Endpoints Requeridos

- `POST /auth/login` - Autenticación
- `GET /tasks` - Obtener todas las tareas
- `GET /tasks/my-tasks` - Obtener tareas del usuario (opcional)
- `GET /notifications` - Obtener notificaciones
- `POST /users/push-token` - Guardar token de notificaciones

## 📱 Instalación en Dispositivo

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## 🧪 Testing

La aplicación incluye un modo mock para testing sin backend:

```typescript
// En src/services/api.ts
const USE_MOCK_API = true; // Cambiar a false para usar backend real
```

## 📦 Build de Producción

```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autor

Desarrollado por Ignacio Sebastián Tapia Loyola

## 🐛 Reportar Issues

Si encuentras algún problema, por favor [abre un issue](https://github.com/tu-usuario/task-mobile-app/issues) en GitHub.

Aplicación móvil desarrollada con React Native y Expo para gestionar tareas y recibir notificaciones push.

## Características

- ✅ Autenticación de usuarios
- 📋 Visualización de tareas asignadas
- 📸 Subida de evidencias (fotos y archivos)
- 🔔 Notificaciones push
- 📱 Navegación intuitiva con pestañas
- 🔄 Actualización de estado de tareas
- �� Perfil de usuario

## Tecnologías Utilizadas

- **React Native** con Expo
- **TypeScript**
- **React Navigation** (Stack y Bottom Tabs)
- **Expo Notifications** para push notifications
- **Expo Image Picker** para captura y selección de imágenes
- **Expo Document Picker** para selección de archivos
- **AsyncStorage** para almacenamiento local

## Instalación y Configuración

### Prerrequisitos

- Node.js (v16 o superior)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app en tu dispositivo móvil

### Pasos de instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar la URL del backend:**
   Edita `src/services/api.ts` y cambia la URL base:
   ```typescript
   const API_BASE_URL = 'http://tu-servidor:3000/api';
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm start
   ```

4. **Ejecutar en dispositivo:**
   - Escanea el código QR con la app Expo Go
   - O ejecuta `npm run android` / `npm run ios`

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── screens/            # Pantallas de la aplicación
│   ├── LoginScreen.tsx
│   ├── TaskListScreen.tsx
│   ├── TaskDetailScreen.tsx
│   ├── NotificationsScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/         # Configuración de navegación
├── services/          # Servicios de API y notificaciones
├── hooks/             # Hooks personalizados
├── types/             # Definiciones de TypeScript
└── utils/             # Utilidades

```

## Funcionalidades Principales

### Autenticación
- Login con usuario y contraseña
- Almacenamiento seguro de tokens
- Logout con confirmación

### Gestión de Tareas
- Lista de tareas asignadas
- Filtrado por estado y prioridad
- Actualización de estado (Pendiente → En Progreso → Completada)
- Vista detallada con toda la información

### Evidencias
- Tomar fotos con la cámara
- Seleccionar imágenes de la galería
- Subir archivos de cualquier tipo
- Visualización en cuadrícula

### Notificaciones
- Configuración automática de permisos
- Notificaciones push para nuevas tareas
- Notificaciones locales de prueba
- Gestión de notificaciones pendientes

## Configuración de Notificaciones Push

1. **Configurar proyecto en Expo:**
   ```bash
   expo init --template blank-typescript
   ```

2. **Obtener Project ID:**
   - Visita [expo.dev](https://expo.dev)
   - Crea un proyecto y obtén el Project ID
   - Actualiza `app.json` con tu Project ID

3. **Configurar en tu backend:**
   El token de notificaciones se obtiene automáticamente y debe enviarse al backend para almacenarlo.

## Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS
- `npm run web` - Ejecuta en navegador web
- `npm run build` - Construye la aplicación

## Configuración de Desarrollo

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
API_BASE_URL=http://localhost:3000/api
EXPO_PROJECT_ID=your-project-id-here
```

### Permisos Requeridos

La aplicación requiere los siguientes permisos:

- **Cámara**: Para tomar fotos como evidencia
- **Galería**: Para seleccionar imágenes existentes
- **Almacenamiento**: Para guardar archivos temporalmente
- **Notificaciones**: Para recibir alertas de tareas

## Deployment

### Expo EAS Build

1. **Instalar EAS CLI:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configurar proyecto:**
   ```bash
   eas build:configure
   ```

3. **Build para Android:**
   ```bash
   eas build --platform android
   ```

4. **Build para iOS:**
   ```bash
   eas build --platform ios
   ```

## Solución de Problemas

### Error de conexión con API
- Verifica que el backend esté ejecutándose
- Asegúrate de que la URL en `api.ts` sea correcta
- En emulador, usa `10.0.2.2` en lugar de `localhost`

### Notificaciones no funcionan
- Las notificaciones push solo funcionan en dispositivos físicos
- Verifica que los permisos estén otorgados
- Confirma que el Project ID esté configurado correctamente

### Problemas con cámara/galería
- Verifica permisos en la configuración del dispositivo
- En iOS, los permisos se solicitan automáticamente
- En Android, pueden requerir configuración manual

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
