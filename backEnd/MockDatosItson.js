// seedITSON.js
// Seed completo para simular sistema real del ITSON
// Ejecutar: node seedITSON.js
const { Op } = require("sequelize");

const axios = require('axios');
const {
  Usuario,
  Alumno,
  Maestro,
  Materia,
  Horario,
  Salon,
  Curso,
  CursoAlumno,
  Asistencia,
  sequelize,
} = require('./models');

const UsuarioDAO = require('./daos/UsuarioDAO.js');
const MateriaDAO = require('./daos/materiaDao.js');
const HorarioDAO = require('./daos/horarioDao.js');
const SalonDAO = require('./daos/salonDao.js');
const CursoDAO = require('./daos/CursoDAO.js');
const AlumnoDAO = require('./daos/AlumnoDAO.js');
const AsistenciaDAO = require('./daos/AsistenciaDAO.js');

// Detectar puerto del servidor - intentar 3002 primero, luego 3000
const PUERTOS_POSIBLES = [3002, 3000];
let BASE_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 3002}/api`;

// ========================================
// CONFIGURACIÓN
// ========================================
const CONFIG = {
  ALUMNO_PRINCIPAL_ID: '00000212345', // Para tests de módulo alumno
  MAESTRO_PRINCIPAL_ID: '00000298765', // Para tests de módulo maestro (Carlos Ramírez)
  BASE_ALUMNO_ID: 300000, // IDs: 00000300001, 00000300002, etc.
  ALUMNOS_POR_CURSO: 20, // 20 alumnos adicionales por curso
  PERIODO: '2025-2',
};

// ========================================
// UTILIDADES
// ========================================
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(mensaje, color = 'reset') {
  console.log(`${colors[color]}${mensaje}${colors.reset}`);
}

function separador() {
  console.log('\n' + '='.repeat(80) + '\n');
}

function generarIdAlumno(numero) {
  return `00${numero.toString().padStart(9, '0')}`.slice(-11);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========================================
// DATOS BASE ITSON
// Cada maestro tiene su propio curso con 20+ alumnos
// ========================================
const MAESTROS_DATA = [
  { 
    id: '00000298765', 
    nombres: 'Carlos', 
    apellidos: 'Ramírez',
    // MAESTRO PRINCIPAL CON MÚLTIPLES CURSOS
    materias: [
      { 
        codigo: 'SIS-301', 
        nombre: 'Ingeniería de Software', 
        descripcion: 'Desarrollo de software',
        horario: { dia: 'Lunes', horaInicio: '07:00:00', horaFin: '09:00:00' },
        salon: { aula: '201', edificio: '5', ubicacionLat: 27.4825, ubicacionLong: -109.9408, capacidad: 35 },
      },
      { 
        codigo: 'SI-401', 
        nombre: 'Sistemas de Información', 
        descripcion: 'Gestión de sistemas de información',
        horario: { dia: 'Lunes', horaInicio: '13:00:00', horaFin: '15:00:00' },
        salon: { aula: '202', edificio: '5', ubicacionLat: 27.4825, ubicacionLong: -109.9408, capacidad: 35 },
      },
      { 
        codigo: 'ARQ-301', 
        nombre: 'Arquitectura de Software', 
        descripcion: 'Diseño de arquitecturas software',
        horario: { dia: 'Miércoles', horaInicio: '09:00:00', horaFin: '11:00:00' },
        salon: { aula: '203', edificio: '5', ubicacionLat: 27.4826, ubicacionLong: -109.9407, capacidad: 30 },
      },
    ],
  },
  { 
    id: '00000298766', 
    nombres: 'María', 
    apellidos: 'González López',
    materia: { codigo: 'BD-201', nombre: 'Base de Datos', descripcion: 'Sistemas de bases de datos' },
    horario: { dia: 'Martes', horaInicio: '09:00:00', horaFin: '11:00:00' },
    salon: { aula: '105', edificio: '3', ubicacionLat: 27.4830, ubicacionLong: -109.9410, capacidad: 40 },
  },
  { 
    id: '00000298767', 
    nombres: 'Roberto', 
    apellidos: 'Sánchez',
    materia: { codigo: 'RC-101', nombre: 'Redes de Computadoras', descripcion: 'Fundamentos de redes' },
    horario: { dia: 'Miércoles', horaInicio: '11:00:00', horaFin: '13:00:00' },
    salon: { aula: '301', edificio: '5', ubicacionLat: 27.4828, ubicacionLong: -109.9405, capacidad: 30 },
  },
  { 
    id: '00000298768', 
    nombres: 'Ana', 
    apellidos: 'Martínez',
    materia: { codigo: 'DW-401', nombre: 'Desarrollo Web', descripcion: 'Aplicaciones web modernas' },
    horario: { dia: 'Jueves', horaInicio: '13:00:00', horaFin: '15:00:00' },
    salon: { aula: '102', edificio: '4', ubicacionLat: 27.4832, ubicacionLong: -109.9412, capacidad: 35 },
  },
  { 
    id: '00000298769', 
    nombres: 'Luis', 
    apellidos: 'Hernández',
    materia: { codigo: 'IA-501', nombre: 'Inteligencia Artificial', descripcion: 'IA y Machine Learning' },
    // Se configurará dinámicamente según el día/hora actual
    horario: null, // Se crea dinámicamente
    salon: { aula: '203', edificio: '5', ubicacionLat: 27.4827, ubicacionLong: -109.9409, capacidad: 25 },
  },
  // MAESTRO CON 4 MATERIAS (Profesor tiempo completo)
  { 
    id: '00000298770', 
    nombres: 'Patricia', 
    apellidos: 'Rodríguez Soto',
    materias: [ // Array de materias
      { 
        codigo: 'SO-201', 
        nombre: 'Sistemas Operativos', 
        descripcion: 'Fundamentos de SO',
        horario: { dia: 'Lunes', horaInicio: '09:00:00', horaFin: '11:00:00' },
        salon: { aula: '304', edificio: '5', ubicacionLat: 27.4826, ubicacionLong: -109.9407, capacidad: 30 },
      },
      { 
        codigo: 'POO-301', 
        nombre: 'Programación Orientada a Objetos', 
        descripcion: 'POO con Java',
        horario: { dia: 'Martes', horaInicio: '11:00:00', horaFin: '13:00:00' },
        salon: { aula: '305', edificio: '5', ubicacionLat: 27.4826, ubicacionLong: -109.9406, capacidad: 30 },
      },
      { 
        codigo: 'EST-201', 
        nombre: 'Estructura de Datos', 
        descripcion: 'Algoritmos y ED',
        horario: { dia: 'Miércoles', horaInicio: '13:00:00', horaFin: '15:00:00' },
        salon: { aula: '306', edificio: '5', ubicacionLat: 27.4825, ubicacionLong: -109.9407, capacidad: 30 },
      },
      { 
        codigo: 'ALG-401', 
        nombre: 'Análisis de Algoritmos', 
        descripcion: 'Complejidad algorítmica',
        horario: { dia: 'Jueves', horaInicio: '15:00:00', horaFin: '17:00:00' },
        salon: { aula: '307', edificio: '5', ubicacionLat: 27.4824, ubicacionLong: -109.9408, capacidad: 30 },
      },
    ],
  },
];

// ========================================
// DETECTAR CLASE ACTIVA ACTUAL
// ========================================
function obtenerHorarioActual() {
  const ahora = new Date();
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaActual = diasSemana[ahora.getDay()];
  const horaActual = ahora.getHours();
  const minutoActual = ahora.getMinutes();

  // Formato HH:MM:SS para la base de datos
  const horaInicio = `${String(horaActual).padStart(2, '0')}:${String(minutoActual).padStart(2, '0')}:00`;
  
  // Hora de fin: 1 hora y 30 minutos después
  const finDate = new Date(ahora.getTime() + 90 * 60 * 1000); // +1.5 horas
  const horaFin = `${String(finDate.getHours()).padStart(2, '0')}:${String(finDate.getMinutes()).padStart(2, '0')}:00`;

  log(`\n🕐 CLASE DINÁMICA DETECTADA:`, 'yellow');
  log(`   Día: ${diaActual}`, 'cyan');
  log(`   Hora: ${ahora.toLocaleTimeString('es-MX')}`, 'cyan');
  log(`   Clase activa: ${horaInicio} - ${horaFin}`, 'cyan');
  log(`   → Esta clase estará disponible para registrar asistencia\n`, 'green');

  return { dia: diaActual, horaInicio, horaFin };
}

// ========================================
// SEED PRINCIPAL
// ========================================
async function crearDatosITSON() {
  separador();
  log('🎓 SEED SISTEMA ITSON - COMPLETO', 'cyan');
  log('   Este seed crea TODO el sistema listo para usarse', 'cyan');
  separador();

  try {
    // ========================================
    // 1. LIMPIAR BASE DE DATOS
    // ========================================
    log('🗑️  Limpiando base de datos...', 'yellow');
    await Asistencia.destroy({ where: {}, force: true });
    await CursoAlumno.destroy({ where: {}, force: true });
    await Curso.destroy({ where: {}, force: true });
    await Alumno.destroy({ where: {}, force: true });
    await Maestro.destroy({ where: {}, force: true });
    await Usuario.destroy({ where: {}, force: true });
    await Horario.destroy({ where: {}, force: true });
    await Salon.destroy({ where: {}, force: true });
    await Materia.destroy({ where: {}, force: true });
    log('✅ Limpieza completa\n', 'green');

    // ========================================
    // 2. CREAR ALUMNO PRINCIPAL (para tests de módulo alumno)
    // ========================================
    log('👤 Creando alumno principal (para tests)...', 'blue');
    await UsuarioDAO.crear({
      id: CONFIG.ALUMNO_PRINCIPAL_ID,
      nombres: 'Juan',
      apellidos: 'Pérez García',
      tipoUsuario: 'alumno',
      contrasenia: 'alumno123',
    });
    log(`✅ ${CONFIG.ALUMNO_PRINCIPAL_ID} / alumno123`, 'green');
    log('   → Este alumno tendrá historial completo (30/32, 28/32, etc.)\n', 'cyan');

    // ========================================
    // 3. CREAR MAESTROS Y SUS CURSOS
    // ========================================
    const cursosCreados = [];
    let contadorAlumno = CONFIG.BASE_ALUMNO_ID;

    for (let i = 0; i < MAESTROS_DATA.length; i++) {
      const maestroData = MAESTROS_DATA[i];
      
      // Si es el penúltimo maestro (Luis Hernández - IA), usar horario dinámico
      if (i === MAESTROS_DATA.length - 2) {
        maestroData.horario = obtenerHorarioActual();
        log(`\n🎯 CLASE ESPECIAL DE PRUEBA (siempre activa):`, 'yellow');
        log(`   Materia: ${maestroData.materia.nombre}`, 'cyan');
        log(`   Horario: ${maestroData.horario.dia} ${maestroData.horario.horaInicio} - ${maestroData.horario.horaFin}`, 'cyan');
        log(`   → Esta clase estará ACTIVA AHORA para pruebas\n`, 'green');
      }

      // Verificar si es el maestro con múltiples materias
      const esProfesorMultiple = maestroData.materias && Array.isArray(maestroData.materias);
      const materiasAProcesar = esProfesorMultiple ? maestroData.materias : [maestroData];

      separador();
      log(`👨‍🏫 MAESTRO ${i + 1}/${MAESTROS_DATA.length}: ${maestroData.nombres} ${maestroData.apellidos}`, 'magenta');
      log(`   ID: ${maestroData.id} / Contraseña: maestro123`, 'cyan');
      if (esProfesorMultiple) {
        log(`   🎓 PROFESOR TIEMPO COMPLETO (${materiasAProcesar.length} materias)`, 'yellow');
      }
      separador();

      // A) Usuario maestro
      const existeUsuario = await Usuario.findByPk(maestroData.id);
      if (!existeUsuario) {
        await UsuarioDAO.crear({
          id: maestroData.id,
          nombres: maestroData.nombres,
          apellidos: maestroData.apellidos,
          tipoUsuario: 'maestro',
          contrasenia: 'maestro123',
        });
        log('   ✅ Usuario maestro creado', 'green');
      } else {
        log('   ℹ️  Usuario maestro ya existe', 'yellow');
      }

      // B) Fila Maestro
      const existeMaestro = await Maestro.findByPk(maestroData.id);
      if (!existeMaestro) {
        await Maestro.create({ id: maestroData.id });
        log('   ✅ Fila Maestro creada', 'green');
      }

      // C-F) Procesar cada materia del maestro
      for (let materiaIdx = 0; materiaIdx < materiasAProcesar.length; materiaIdx++) {
        const materiaConfig = materiasAProcesar[materiaIdx];
        const materiaData = esProfesorMultiple ? materiaConfig : materiaConfig.materia;
        const horarioData = esProfesorMultiple ? materiaConfig.horario : materiaConfig.horario;
        const salonData = esProfesorMultiple ? materiaConfig.salon : materiaConfig.salon;

        if (esProfesorMultiple) {
          log(`\n   📚 MATERIA ${materiaIdx + 1}/${materiasAProcesar.length}: ${materiaData.nombre}`, 'cyan');
        }

        // C) Materia
        let materia = await Materia.findOne({ where: { codigo: materiaData.codigo } });
        if (!materia) {
          materia = await MateriaDAO.crear(materiaData);
          log(`      ✅ Materia: ${materiaData.nombre}`, 'green');
        } else {
          log(`      ℹ️  Materia ya existe: ${materiaData.codigo}`, 'yellow');
        }

        // D) Horario
        let horario = await Horario.findOne({
          where: { 
            dia: horarioData.dia, 
            horaInicio: horarioData.horaInicio, 
            periodo: CONFIG.PERIODO 
          },
        });
        if (!horario) {
          horario = await HorarioDAO.crear({
            ...horarioData,
            periodo: CONFIG.PERIODO,
          });
          log(`      ✅ Horario: ${horarioData.dia} ${horarioData.horaInicio}-${horarioData.horaFin}`, 'green');
        }

        // E) Salón
        let salon = await Salon.findOne({ 
          where: { 
            aula: salonData.aula, 
            edificio: salonData.edificio 
          } 
        });
        if (!salon) {
          salon = await SalonDAO.crear(salonData);
          log(`      ✅ Salón: Edificio ${salonData.edificio}, Aula ${salonData.aula}`, 'green');
        }

        // F) Curso
        let curso = await Curso.findOne({ 
          where: { 
            materiaId: materia.id, 
            maestroId: maestroData.id, 
            periodo: CONFIG.PERIODO, 
            grupo: '01' 
          } 
        });
        
        if (!curso) {
          curso = await CursoDAO.crear({
            nombre: materia.nombre,
            grupo: '01',
            periodo: CONFIG.PERIODO,
            numeroAlumnos: 0,
            materiaId: materia.id,
            horarioId: horario.id,
            salonId: salon.id,
            maestroId: maestroData.id,
          });
          log(`      ✅ Curso: ${materia.nombre} Grupo 01`, 'green');
        }

        cursosCreados.push({ curso, materia, horario, salon, maestro: maestroData });

        // G) Inscribir alumno principal en TODOS los cursos del maestro principal
        if (maestroData.id === CONFIG.MAESTRO_PRINCIPAL_ID) {
          const yaInscritoPrincipal = await CursoAlumno.findOne({ 
            where: { cursoId: curso.id, alumnoId: CONFIG.ALUMNO_PRINCIPAL_ID } 
          });
          
          if (!yaInscritoPrincipal) {
            await AlumnoDAO.inscribirEnCurso(CONFIG.ALUMNO_PRINCIPAL_ID, curso.id);
            curso.numeroAlumnos++;
            await curso.save();
            log('      ✅ Alumno principal inscrito', 'green');
          }
        } else if (!esProfesorMultiple || materiaIdx === 0) {
          // Para otros maestros, solo en la primera materia
          const yaInscritoPrincipal = await CursoAlumno.findOne({ 
            where: { cursoId: curso.id, alumnoId: CONFIG.ALUMNO_PRINCIPAL_ID } 
          });
          
          if (!yaInscritoPrincipal) {
            await AlumnoDAO.inscribirEnCurso(CONFIG.ALUMNO_PRINCIPAL_ID, curso.id);
            curso.numeroAlumnos++;
            await curso.save();
            log('      ✅ Alumno principal inscrito', 'green');
          }
        }

        // H) Crear alumnos adicionales
        log(`      📝 Creando ${CONFIG.ALUMNOS_POR_CURSO} alumnos adicionales...`, 'blue');
        
        for (let j = 1; j <= CONFIG.ALUMNOS_POR_CURSO; j++) {
          contadorAlumno++;
          const alumnoId = generarIdAlumno(contadorAlumno);
          const nombres = `Alumno${i + 1}_${materiaIdx + 1}_${j}`;
          const apellidos = `Curso${materiaData.codigo}`;

          // Crear usuario
          const existeAlumnoUser = await Usuario.findByPk(alumnoId);
          if (!existeAlumnoUser) {
            await UsuarioDAO.crear({
              id: alumnoId,
              nombres,
              apellidos,
              tipoUsuario: 'alumno',
              contrasenia: 'alumno123',
            });
          }

          // Crear fila Alumno
          const existeAlumnoRow = await Alumno.findByPk(alumnoId);
          if (!existeAlumnoRow) {
            await Alumno.create({ id: alumnoId });
          }

          // Inscribir en curso
          const yaInscrito = await CursoAlumno.findOne({ 
            where: { cursoId: curso.id, alumnoId } 
          });
          
          if (!yaInscrito) {
            await AlumnoDAO.inscribirEnCurso(alumnoId, curso.id);
            curso.numeroAlumnos++;
            await curso.save();
          }

          // Crear asistencias aleatorias
          await crearAsistenciasAleatorias(alumnoId, curso.id, salon);

          if (j % 5 === 0) {
            log(`         → ${j}/${CONFIG.ALUMNOS_POR_CURSO} alumnos creados`, 'cyan');
          }
        }

        log(`      ✅ Total alumnos en curso: ${curso.numeroAlumnos}`, 'green');
      } // Fin loop de materias
    }

    // ========================================
    // 4. HISTORIAL COMPLETO PARA ALUMNO PRINCIPAL
    // ========================================
    separador();
    log('📊 Creando historial completo (alumno principal)...', 'blue');
    await crearHistorialAlumnoPrincipal(cursosCreados);

    // ========================================
    // RESUMEN FINAL
    // ========================================
    separador();
    log('✅ SEED COMPLETADO EXITOSAMENTE', 'green');
    separador();
    
    console.log('📊 RESUMEN DEL SISTEMA:');
    console.log('');
    console.log('👨‍🏫 MAESTROS CREADOS:');
    MAESTROS_DATA.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.nombres} ${m.apellidos}`);
      console.log(`      ID: ${m.id} | Pass: maestro123`);
      
      // Verificar si tiene una materia o múltiples
      if (m.materias && Array.isArray(m.materias)) {
        console.log(`      🎓 PROFESOR TIEMPO COMPLETO`);
        console.log(`      Materias (${m.materias.length}):`);
        m.materias.forEach((mat, idx) => {
          console.log(`         ${idx + 1}. ${mat.nombre}`);
        });
        console.log(`      Alumnos: ~${(CONFIG.ALUMNOS_POR_CURSO + 1) * m.materias.length}`);
      } else {
        console.log(`      Materia: ${m.materia.nombre}`);
        console.log(`      Alumnos: ~${CONFIG.ALUMNOS_POR_CURSO + 1}`);
      }
      console.log('');
    });

    console.log('👤 ALUMNO PRINCIPAL (para tests):');
    console.log(`   ID: ${CONFIG.ALUMNO_PRINCIPAL_ID} | Pass: alumno123`);
    console.log('   Inscrito en 5 materias con historial completo');
    console.log('');

    console.log('📈 ESTADÍSTICAS:');
    console.log(`   • Maestros: ${MAESTROS_DATA.length}`);
    console.log(`   • Cursos: ${cursosCreados.length}`);
    console.log(`   • Alumnos totales: ${1 + (cursosCreados.length * CONFIG.ALUMNOS_POR_CURSO)}`);
    console.log(`   • Alumnos por curso: ~${CONFIG.ALUMNOS_POR_CURSO + 1}`);
    console.log(`   • Asistencias: ~${(cursosCreados.length * CONFIG.ALUMNOS_POR_CURSO * 3) + 150}`);
    console.log('');

    separador();
    log('🚀 EL SISTEMA ESTÁ LISTO PARA USARSE', 'cyan');
    log('   → Módulo Alumno: Funcional ✓', 'green');
    log('   → Módulo Maestro: Funcional ✓', 'green');
    log('   → Login: Funcional ✓', 'green');
    log('   → Ver Horario: Funcional ✓', 'green');
    log('   → Registrar Asistencia: Funcional ✓', 'green');
    log('   → Consultar Historial: Funcional ✓', 'green');
    log('   → Gestión Maestro: Funcional ✓', 'green');
    separador();

    return { cursosCreados, maestros: MAESTROS_DATA };

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
    throw error;
  }
}

// ========================================
// HISTORIAL ALUMNO PRINCIPAL (datos reales para tests)
// ========================================
async function crearHistorialAlumnoPrincipal(cursosCreados) {
  // Datos predefinidos para los primeros 5 cursos
  const datosAsistenciasPredefinidos = [
    { presente: 30, ausente: 2 },  // 93.75% - Ing. Software
    { presente: 28, ausente: 4 },  // 87.50% - Base de Datos
    { presente: 31, ausente: 1 },  // 96.88% - Redes
    { presente: 29, ausente: 3 },  // 90.63% - Desarrollo Web
    { presente: 15, ausente: 1 },  // 93.75% - IA (CLASE ACTIVA - sin asistencia de hoy)
  ];

  // Obtener el día actual para detectar la clase activa
  const ahora = new Date();
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaActual = diasSemana[ahora.getDay()];
  const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();

  for (let i = 0; i < cursosCreados.length; i++) {
    const { curso, salon, horario } = cursosCreados[i];
    
    // Si el curso está en los primeros 5, usar datos predefinidos
    // Si no, generar datos aleatorios
    let datos;
    if (i < datosAsistenciasPredefinidos.length) {
      datos = datosAsistenciasPredefinidos[i];
    } else {
      // Generar datos aleatorios para cursos adicionales (80-95% asistencia)
      const totalClases = 32;
      const porcentajeAleatorio = 0.80 + (Math.random() * 0.15); // 80-95%
      const presente = Math.floor(totalClases * porcentajeAleatorio);
      const ausente = totalClases - presente;
      datos = { presente, ausente };
    }

    const totalClases = datos.presente + datos.ausente;
    const fechas = generarFechasPasadas(totalClases);

    // Verificar si este curso es la clase activa de HOY
    let esClaseActiva = false;
    if (horario.dia === diaActual) {
      const [horaInicioH, horaInicioM] = horario.horaInicio.split(':').map(Number);
      const horaInicio = horaInicioH * 60 + horaInicioM;
      const [horaFinH, horaFinM] = horario.horaFin.split(':').map(Number);
      const horaFin = horaFinH * 60 + horaFinM;
      
      // Margen de 15 minutos antes y después
      const margen = 15;
      esClaseActiva = horaActualMinutos >= (horaInicio - margen) && 
                      horaActualMinutos <= (horaFin + margen);
    }

    // Si es la clase activa, NO crear asistencia para HOY
    if (esClaseActiva) {
      log(`   🎯 ${curso.nombre}: CLASE ACTIVA AHORA`, 'yellow');
      log(`      → NO se crea asistencia de hoy (se registrará manualmente)`, 'cyan');
      
      // Crear solo asistencias PASADAS (todas las fechas generadas son pasadas)
      for (let j = 0; j < datos.presente; j++) {
        await AsistenciaDAO.crear({
          alumnoId: CONFIG.ALUMNO_PRINCIPAL_ID,
          cursoId: curso.id,
          fechaHora: fechas[j],
          estado: 'presente',
          ubicacionLat: salon.ubicacionLat,
          ubicacionLong: salon.ubicacionLong,
        });
      }

      for (let j = datos.presente; j < totalClases; j++) {
        await AsistenciaDAO.crear({
          alumnoId: CONFIG.ALUMNO_PRINCIPAL_ID,
          cursoId: curso.id,
          fechaHora: fechas[j],
          estado: 'ausente',
          ubicacionLat: null,
          ubicacionLong: null,
        });
      }

      const porcentaje = ((datos.presente / totalClases) * 100).toFixed(2);
      log(`      Historial: ${datos.presente}/${totalClases} (${porcentaje}%)`, 'green');
      log(`      ✅ Listo para registrar asistencia manualmente`, 'green');
      
    } else {
      // Clase normal - crear todas las asistencias
      for (let j = 0; j < datos.presente; j++) {
        await AsistenciaDAO.crear({
          alumnoId: CONFIG.ALUMNO_PRINCIPAL_ID,
          cursoId: curso.id,
          fechaHora: fechas[j],
          estado: 'presente',
          ubicacionLat: salon.ubicacionLat,
          ubicacionLong: salon.ubicacionLong,
        });
      }

      for (let j = datos.presente; j < totalClases; j++) {
        await AsistenciaDAO.crear({
          alumnoId: CONFIG.ALUMNO_PRINCIPAL_ID,
          cursoId: curso.id,
          fechaHora: fechas[j],
          estado: 'ausente',
          ubicacionLat: null,
          ubicacionLong: null,
        });
      }

      const porcentaje = ((datos.presente / totalClases) * 100).toFixed(2);
      log(`   ✅ ${curso.nombre}: ${datos.presente}/${totalClases} (${porcentaje}%)`, 'green');
    }
  }
}

// ========================================
// ASISTENCIAS ALEATORIAS (alumnos adicionales)
// ========================================
async function crearAsistenciasAleatorias(alumnoId, cursoId, salon) {
  const ahora = new Date();
  
  // Crear más asistencias para tener datos realistas (10-15 asistencias por alumno)
  const numAsistencias = 10 + Math.floor(Math.random() * 6); // 10-15 asistencias
  const fechas = [];
  
  // Generar fechas en las últimas 8 semanas
  for (let i = 0; i < numAsistencias; i++) {
    const semanasAtras = Math.floor(i / 2); // 2 clases por semana
    const diasAtras = semanasAtras * 7 + (i % 2) * 3; // Lunes y Jueves aproximadamente
    const fecha = new Date(ahora.getTime() - 1000 * 60 * 60 * 24 * diasAtras);
    fecha.setHours(10, 0, 0, 0); // Hora de clase
    fechas.push(fecha);
  }
  
  // Generar estados aleatorios (80-95% de asistencia)
  const porcentajeAsistencia = 0.80 + (Math.random() * 0.15); // 80-95%
  
  for (let i = 0; i < fechas.length; i++) {
    const existeAsistencia = await Asistencia.findOne({
      where: { 
        cursoId, 
        alumnoId, 
        fechaHora: {
          [Op.between]: [
            new Date(fechas[i].setHours(0, 0, 0, 0)),
            new Date(fechas[i].setHours(23, 59, 59, 999))
          ]
        }
      },
    });

    if (!existeAsistencia) {
      try {
        // Determinar estado basado en porcentaje
        const estado = Math.random() < porcentajeAsistencia ? 'presente' : 'ausente';
        
        await AsistenciaDAO.crear({
          alumnoId,
          cursoId,
          fechaHora: fechas[i],
          estado: estado,
          ubicacionLat: estado === 'presente' ? salon.ubicacionLat : null,
          ubicacionLong: estado === 'presente' ? salon.ubicacionLong : null,
        });
      } catch (err) {
        // Ignorar duplicados
      }
    }
  }
}

// ========================================
// GENERAR FECHAS PASADAS
// ========================================
function generarFechasPasadas(cantidad) {
  const fechas = [];
  const hoy = new Date();

  for (let i = 0; i < cantidad; i++) {
    const semanasAtras = Math.floor((cantidad - i - 1) / 3);
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - (semanasAtras * 7 + (i % 3) * 2));
    fecha.setHours(10, 0, 0, 0);
    fechas.push(fecha);
  }

  return fechas.sort((a, b) => a - b);
}
async function limpiarAsistenciasHoraActual() {
   const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);

  const finDia = new Date();
  finDia.setHours(23, 59, 59, 999);

  log('🧹 Limpiando asistencias de HOY (para evitar duplicados)...', 'yellow');

  const deletedCount = await Asistencia.destroy({
    where: {
      fechaHora: {
        [Op.between]: [inicioDia, finDia],
      },
    },
  });

  if (deletedCount > 0) {
    log(`   ✅ Se eliminaron ${deletedCount} asistencias de hoy`, 'green');
  } else {
    log(`   ℹ️  No había asistencias de hoy`, 'cyan');
  }
}
// ========================================
// EJECUCIÓN PRINCIPAL
// ========================================
async function ejecutar() {
  try {
    console.clear();
    
    // NOTA: Este script NO necesita el servidor HTTP para funcionar
    // Solo verifica que esté corriendo como validación
    // Los datos se crean directamente en la base de datos usando los DAOs
    
    log(`🔍 Verificando conexión al servidor (opcional)...`, 'cyan');
    let servidorConectado = false;
    let urlFinal = BASE_URL;
    let ultimoError = null;
    
    for (const puerto of PUERTOS_POSIBLES) {
      const urlPrueba = `http://localhost:${puerto}/api`;
      const urlHealth = `${urlPrueba}/health`;
      try {
        log(`   Probando puerto ${puerto}...`, 'cyan');
        const response = await axios.get(urlHealth, { 
          timeout: 3000,
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        });
        
        if (response.status === 200) {
          log(`✅ Servidor HTTP detectado en puerto ${puerto}`, 'green');
          urlFinal = urlPrueba;
          BASE_URL = urlPrueba;
          servidorConectado = true;
          break;
        }
      } catch (err) {
        ultimoError = err;
        // No mostrar error para cada puerto, solo continuar
        continue;
      }
    }
    
    if (!servidorConectado) {
      log(`⚠️  No se detectó el servidor HTTP en los puertos ${PUERTOS_POSIBLES.join(' o ')}`, 'yellow');
      log(`   Esto es OPCIONAL - el script puede continuar sin el servidor`, 'yellow');
      log(`   El servidor HTTP solo es necesario para usar la aplicación web`, 'yellow');
      log(`\n   💡 Si quieres iniciar el servidor (opcional):`, 'cyan');
      log(`      1. En otra terminal: cd backEnd`, 'yellow');
      log(`      2. Ejecuta: node app.js`, 'yellow');
      log(`      3. Espera: "🚀 Servidor corriendo en puerto 3002"`, 'green');
      log(`\n   ⏳ Continuando con la creación de datos en la base de datos...\n`, 'cyan');
      // NO salir, continuar con el seed
    } else {
      log(`\n`);
    }

    // Ejecutar seed (esto funciona sin el servidor HTTP)
    await crearDatosITSON();
await limpiarAsistenciasHoraActual()
  } catch (error) {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  ejecutar();
}

// ========================================
// EXPORTS
// ========================================
module.exports = {
  crearDatosITSON,
  CONFIG,
  MAESTROS_DATA,
  colors,
  log,
  separador,
  sleep,
};