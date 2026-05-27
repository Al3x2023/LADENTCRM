# LIADENT CRM - Casos de Uso y Manual de Pruebas

## Resumen de Pruebas Automatizadas

Se ejecutaron 27 pruebas automatizadas con el siguiente resultado:
- **Pruebas exitosas:** 27 ✅
- **Pruebas fallidas:** 0 ❌
- **Porcentaje de éxito:** 100%

---

## Credenciales por Defecto

```
Usuario: admin
Contraseña: admin123
```

---

## Casos de Uso - Pruebas Manuales

### 1. AUTENTICACIÓN

#### Caso 1.1: Login Exitoso
1. Abrir la aplicación
2. Ingresar usuario: `admin`
3. Ingresar contraseña: `admin123`
4. Clic en "Acceder al Sistema"
**Resultado esperado:** Redirección al Dashboard con mensaje "Sesión iniciada correctamente"

#### Caso 1.2: Login Fallido
1. Abrir la aplicación
2. Ingresar usuario: `admin`
3. Ingresar contraseña: `wrongpassword`
**Resultado esperado:** Mensaje de error "Contraseña incorrecta"

#### Caso 1.3: Logout
1. Estando logueado, hacer clic en el avatar/nombre
2. Seleccionar "Cerrar sesión"
**Resultado esperado:** Redirección a pantalla de login

---

### 2. GESTIÓN DE PACIENTES

#### Caso 2.1: Registrar Nuevo Paciente
1. Ir a módulo "Pacientes"
2. Clic en "Nuevo Paciente"
3. Completar campos obligatorios:
   - Nombre: `Juan Pérez García`
   - Email: `juan@email.com`
   - Teléfono: `555-1234`
   - Fecha de nacimiento: `1990-05-15`
   - Dirección: `Calle Principal 123`
4. Opcional: Agregar alergias, tipo de sangre
5. Clic en "Guardar"
**Resultado esperado:** Mensaje "Paciente registrado correctamente" y paciente aparece en la lista

#### Caso 2.2: Editar Paciente
1. En la lista de pacientes, hacer clic en "Editar"
2. Modificar algún campo (ej: cambiar teléfono)
3. Clic en "Guardar"
**Resultado esperado:** Mensaje "Paciente actualizado correctamente"

#### Caso 2.3: Ver Historial Clínico
1. En la lista de pacientes, hacer clic en "Ver Historial"
**Resultado esperado:** Abrir pestaña con historial clínico completo

#### Caso 2.4: Eliminar Paciente
1. En la lista de pacientes, hacer clic en "Eliminar"
2. Confirmar eliminación
**Resultado esperado:** Mensaje "Paciente eliminado" y paciente removido de la lista

---

### 3. CITAS Y AGENDA

#### Caso 3.1: Programar Nueva Cita
1. Ir a módulo "Citas"
2. Clic en "Nueva Cita"
3. Seleccionar paciente del dropdown
4. Seleccionar fecha y hora
5. Ingresar motivo: `Limpieza dental`
6. Ingresar costo: `100`
7. Clic en "Guardar"
**Resultado esperado:** Cita aparece en el calendario con estado "Pendiente"

#### Caso 3.2: Cambiar Estado de Cita
1. En el calendario/lista de citas, hacer clic en el badge de estado
2. Seleccionar nuevo estado (ej: "Llegó", "Atendiendo", "Completado")
**Resultado esperado:** Estado actualizado con confirmación visual

#### Caso 3.3: Registrar Pago
1. En la cita, hacer clic en "Registrar pago"
2. Ingresar monto pagado
**Resultado esperado:** Pago registrado correctamente

---

### 4. HISTORIAL CLÍNICO (HCE)

#### Caso 4.1: Agregar Nota de Evolución
1. Ir a "Pacientes" → "Ver Historial"
2. Pestaña "Notas de Evolución"
3. Clic en "Nueva Evolución"
4. Ingresar signos vitales (opcional):
   - Temperatura: `36.5`
   - Presión arterial: `120/80`
   - Frecuencia cardíaca: `72`
5. Ingresar contenido: `Paciente presenta caries en molar inferior derecho`
6. Clic en "Guardar Nota"
**Resultado esperado:** Nota guardada con fecha y datos del médico

#### Caso 4.2: Generar Receta Médica
1. Pestaña "Recetas Médicas"
2. Clic en "Nueva Receta"
3. Agregar medicamentos:
   - Nombre: `Ibuprofeno 400mg`
   - Dosis: `1 tableta`
   - Frecuencia: `cada 8 horas`
   - Duración: `por 5 días`
4. Agregar instrucciones adicionales
5. Clic en "Guardar Receta"
**Resultado esperado:** Receta generada con vista previa

#### Caso 4.3: Generar PDF de Receta
1. En la lista de recetas, hacer clic en "Imprimir PDF"
**Resultado esperado:** Descarga automática del archivo PDF con formato profesional

#### Caso 4.4: Usar Odontograma
1. Pestaña "Odontograma"
2. Clic en un diente
3. Seleccionar condición (caries, restauración, etc.)
4. Agregar notas específicas
5. Clic en "Guardar"
**Resultado esperado:** Odontograma actualizado con los cambios

#### Caso 4.5: Subir Imágenes
1. Pestaña "Imágenes"
2. Clic en "Subir Imagen"
3. Seleccionar categoría (Rx, Fotografía, etc.)
4. Seleccionar archivo de imagen
**Resultado esperado:** Imagen subida y visible en la galería

#### Caso 4.6: Usar Calculadoras Clínicas
1. Pestaña "Calculadoras"
2. Seleccionar tipo de calculadora:
   - **Glucosa:** Ingresar valor y ver conversión instantánea
   - **Dosis Pediátrica:** Ingresar peso y dosis unitaria
   - **Anestesia:** Ingresar peso y calcular dosis máxima segura
   - **Clasificación Niño:** Ingresar edad y ver etapa de desarrollo
   - **IMC:** Ingresar peso y altura
**Resultado esperado:** Resultado calculado con explicación y recordatorios clínicos

---

### 5. FACTURACIÓN

#### Caso 5.1: Crear Nueva Factura
1. Ir a módulo "Facturación"
2. Clic en "Nueva Factura"
3. Seleccionar paciente
4. Agregar conceptos:
   - Opción rápida: Clic en botón "Rápido" y seleccionar tratamiento predefinido
   - Manual: Agregar descripción, cantidad y precio
5. Marcar/desmarcar IVA por ítem
6. Agregar notas (opcional)
7. Clic en "Generar Factura"
**Resultado esperado:** Factura creada con número único, subtotal, IVA y total correctos

#### Caso 5.2: Cambiar Estado de Factura
1. En la lista de facturas, hacer clic en el icono de estado
2. Seleccionar: Pagado, Parcial, Cancelado
**Resultado esperado:** Estado actualizado

#### Caso 5.3: Descargar PDF de Factura
1. En la lista de facturas, hacer clic en "Descargar"
**Resultado esperado:** PDF descargado con formato fiscal

#### Caso 5.4: Exportar a CSV
1. Clic en "Exportar CSV"
**Resultado esperado:** Archivo CSV descargado con todas las facturas

#### Caso 5.5: Gestionar Tratamientos
1. Pestaña "Conceptos" (en historial clínico)
2. Clic en "Nuevo Tratamiento"
3. Agregar:
   - Nombre: `Implante Dental`
   - Categoría: Tratamiento/Material/Servicio
   - Precio: `800`
   - Aplicar IVA: Sí/No
4. Clic en "Guardar"
**Resultado esperado:** Tratamiento guardado disponible para selección rápida

---

### 6. ADMINISTRACIÓN Y SEGURIDAD

#### Caso 6.1: Crear Nuevo Usuario
1. Ir a módulo "Personal"
2. Pestaña "Personal Médico"
3. Clic en "Nuevo Usuario"
4. Completar datos:
   - Nombre completo
   - Usuario
   - Contraseña
   - Rol: Administrador/Doctor/Recepcionista
   - Email (opcional)
5. Clic en "Crear Usuario"
**Resultado esperado:** Usuario creado con estado "Activo"

#### Caso 6.2: Editar Usuario
1. En la lista, hacer clic en "Editar"
2. Modificar rol, nombre o email
3. Activar/Desactivar usuario
4. Clic en "Guardar"
**Resultado esperado:** Usuario actualizado

#### Caso 6.3: Resetear Contraseña
1. En la lista, hacer clic en "Reset Pass"
2. Ingresar nueva contraseña (mínimo 6 caracteres)
3. Clic en "Resetear"
**Resultado esperado:** Contraseña actualizada

#### Caso 6.4: Eliminar Usuario
1. En la lista, hacer clic en "Eliminar"
2. Confirmar eliminación
**Nota:** No se puede eliminar el administrador principal (ID=1)
**Resultado esperado:** Usuario eliminado

#### Caso 6.5: Ver Registro de Auditoría
1. Pestaña "Registro de Auditoría (HIPAA/RGPD)"
**Resultado esperado:** Lista de todas las acciones realizadas con:
- Timestamp
- Usuario
- Módulo
- Acción
- Detalles

---

### 7. CONFIGURACIÓN

#### Caso 7.1: Cambiar Contraseña Propia
1. Ir a "Configuración"
2. Sección "Seguridad"
3. Ingresar contraseña actual
4. Ingresar nueva contraseña
5. Confirmar nueva contraseña
6. Clic en "Cambiar"
**Resultado esperado:** Contraseña actualizada con confirmación

---

## Funcionalidades Especiales Verificadas

### Encriptación de Datos Sensibles
- ✅ DNI/ID_number se encripta con AES-256-CBC
- ✅ Solo el usuario autorizado puede ver el DNI desencriptado
- ✅ Los datos encriptados se almacenan en formato "IV:encrypted_data"

### Integridad de Datos
- ✅ Foreign Keys activadas (no permite FK inválidas)
- ✅ Constraints de unicidad (username, nombre de tratamiento)
- ✅ Eliminación en cascada (al eliminar paciente, se eliminan datos relacionados)

### Auditoría HIPAA/RGPD
- ✅ Registro de todas las acciones críticas
- ✅ Timestamp automático
- ✅ Usuario asociado a cada acción
- ✅ Detalles de cada operación

### Generación de PDFs
- ✅ Recetas médicas con formato profesional
- ✅ Facturas con datos fiscales
- ✅ Encabezados de clínica y pie de firma

---

## Tratamientos Predefinidos en Base de Datos

Al instalar la aplicación, el sistema incluye automáticamente:

### Servicios de Diagnóstico
- Radiografía Panorámica - $50 (IVA: Sí)
- Radiografía Periapical - $25 (IVA: Sí)
- Tomografía CBCT - $150 (IVA: Sí)

### Tratamientos Preventivos
- Limpieza Profunda - $100 (IVA: Sí)
- Profilaxis Dental - $50 (IVA: Sí)
- Aplicación de Flúor - $30 (IVA: Sí)
- Sellantes - $40 (IVA: Sí)

### Endodoncia
- Conducto Unirradicular - $300 (IVA: Sí)
- Conducto Birradicular - $400 (IVA: Sí)
- Conducto Multirradicular - $500 (IVA: Sí)
- Retratamiento - $350 (IVA: Sí)

### Cirugía
- Extracción Simple - $200 (IVA: Sí)
- Extracción Compleja - $400 (IVA: Sí)
- Extracción de Cordales - $350 (IVA: Sí)

### Protesis
- Corona de Porcelana - $600 (IVA: Sí)
- Puente Dental - $1200 (IVA: Sí)
- Protesis Removible - $500 (IVA: Sí)
- Protesis Total - $1000 (IVA: Sí)

### Ortodoncia
- Aparatología Fija - $3000 (IVA: Sí)
- Aparatología Removible - $800 (IVA: Sí)

### Estética
- Blanqueamiento Consultorio - $300 (IVA: Sí)
- Kit Blanqueamiento Casero - $200 (IVA: Sí)

### Materiales (sin IVA)
- Composite Restauración - $80
- Ionómero de Vidrio - $60
- Amalgama Dental - $50
- Cemento Definitivo - $40

---

## Notas Técnicas

1. **Base de datos:** SQLite con better-sqlite3
2. **Encriptación:** AES-256-CBC para datos sensibles
3. **Hashing:** SHA-256 para contraseñas
4. **Auditoría:** Registro automático de todas las operaciones críticas
5. **Integridad:** Foreign keys activadas por defecto
6. **PDF:** jsPDF para generación de documentos
7. **UI:** React + TypeScript con Tailwind CSS

---

## Resolución de Problemas

### La aplicación no abre
- Verificar que el build se completó correctamente
- Revisar logs en consola del sistema
- Verificar que better-sqlite3 está compilado para la versión de Node

### Error al generar factura
- Verificar que existe al menos un paciente en la base de datos
- Verificar que los items tienen descripción y precio
- El sistema calcula automáticamente total_price

### Error al subir imágenes
- El directorio de imágenes se crea automáticamente en userData
- Formatos soportados: jpg, png, jpeg, webp

### Contraseña olvidada
- Usar la función "Reset Pass" desde una cuenta de administrador
- La contraseña del admin por defecto es "admin123"
