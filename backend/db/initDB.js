const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      usuario_id INTEGER,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
      UNIQUE(nombre, usuario_id)
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_usuario TEXT NOT NULL UNIQUE,
      contrasena_hash TEXT NOT NULL,
      ultimo_inicio_sesion TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contactos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      primer_nombre TEXT NOT NULL,
      segundo_nombre TEXT,
      primer_apellido TEXT NOT NULL,
      segundo_apellido TEXT,
      telefono TEXT NOT NULL,
      correo_electronico TEXT NOT NULL,
      foto_perfil BLOB,
      fecha_nacimiento DATE,
      usuario_id INTEGER,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
      UNIQUE(correo_electronico, usuario_id)
    );

    CREATE TABLE IF NOT EXISTS direcciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contacto_id INTEGER,
      pais TEXT,
      departamento TEXT,
      municipio TEXT,
      codigo_postal TEXT,
      direccion_completa TEXT,
      FOREIGN KEY(contacto_id) REFERENCES contactos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contacto_categorias (
      contacto_id INTEGER,
      categoria_id INTEGER,
      PRIMARY KEY(contacto_id, categoria_id),
      FOREIGN KEY(contacto_id) REFERENCES contactos(id) ON DELETE CASCADE,
      FOREIGN KEY(categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inicios_sesion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      fecha_hora TIMESTAMP,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `);
});

db.close();