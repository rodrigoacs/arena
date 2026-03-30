import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' })
  }

  // O formato esperado é "Bearer <token>"
  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token.' })
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Injetamos o id do admin na requisição para uso nos controllers
    req.adminId = decoded.id

    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}