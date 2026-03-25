//By:  𝙂𝙤𝙙'𝙨 𝙕𝙚𝙖𝙡 †
//https://wa.me/2347049283499
//https://github.com/Godszeal
//https://github.com/AiOfLautech
//https://t.me/AiOfLautech
//https://whatsapp.com/channel/0029VaIiMsqJf05e4Y4b9u0z
//

const {
   spawn
} = require('child_process')
const path = require('path')

function start() {
   let args = [path.join(__dirname, 'index.js'), ...process.argv.slice(2)]
   console.log([process.argv[0], ...args].join('\n'))
   let p = spawn(process.argv[0], args, {
         stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      })
      .on('message', data => {
         if (data == 'reset') {
            console.log('Restarting Qᴜᴇᴇɴ ᴀʙɪᴍꜱ 👑...')
            p.kill()
            start()
            delete p
         }
      })
      .on('exit', code => {
         console.error('Exited with code:', code)
         if (code == '.' || code == 1 || code == 0) start()
      })
}
start()
