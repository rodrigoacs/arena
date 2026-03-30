import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})

pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente do banco de dados', err)
  process.exit(-1)
})

export const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('Executed query', { text, duration, rows: res.rowCount })
  return res
}

export const getClient = async () => {
  const client = await pool.connect()
  const query = client.query
  const release = client.release

  const timeout = setTimeout(() => {
    console.error('Um client ficou ativo por muito tempo antes de ser liberado.')
  }, 5000)

  client.query = (...args) => {
    client.lastQuery = args
    return query.apply(client, args)
  }

  client.release = () => {
    clearTimeout(timeout)
    client.query = query
    client.release = release
    return release.apply(client)
  }

  return client
}