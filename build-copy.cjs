const fs = require('fs')
const path = require('path')

function copy(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  fs.readdirSync(src).forEach((f) => {
    const s = path.join(src, f)
    const d = path.join(dest, f)
    if (fs.statSync(s).isDirectory()) {
      copy(s, d)
    } else {
      fs.copyFileSync(s, d)
    }
  })
}

copy('api', 'dist/api')
copy('server', 'dist/server')
