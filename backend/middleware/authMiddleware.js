const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ error: 'Token requerido' });

  jwt.verify(token, 'KatherineFlores_0909_22_1883', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });

    req.usuario = decoded;
    next();
  });
}

module.exports = verificarToken;
