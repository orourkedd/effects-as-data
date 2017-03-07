const path = require('path')
const fs = require('fs')

const writeFile = (action) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(action.path, action.data, {encoding: 'utf8'}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          realpath: path.resolve(action.path),
          path: action.path
        })
      }
    })
  })
}

module.exports = {
  writeFile
}
