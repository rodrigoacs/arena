import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { query } from '../config/db.js'

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const result = await query(
      'INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Este email já está cadastrado.' })
    }
    console.error('Erro ao criar admin:', error)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
    }

    const result = await query('SELECT * FROM admins WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const admin = result.rows[0]
    const match = await bcrypt.compare(password, admin.password_hash)

    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      admin: { id: admin.id, name: admin.name, email: admin.email },
      token
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

export const getAdminProfile = async (req, res) => {
  try {
    const { id } = req.params
    const result = await query('SELECT id, name, email, created_at FROM admins WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin não encontrado.' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao buscar admin:', error)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}