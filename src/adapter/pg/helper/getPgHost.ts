export const getPgHost = () => {
  return require('fs').existsSync('/.dockerenv')
    ? process.env.PG_HOST!
    : 'localhost'
}
