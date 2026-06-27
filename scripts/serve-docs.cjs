/* Minimaler statischer Server für docs/ (lokale Vorschau, kein npm nötig). */
const http=require('http'), fs=require('fs'), path=require('path')
const root=path.join(__dirname,'..','docs'), port=process.env.PORT||8770
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json'}
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/')p='/index.html'
  const f=path.join(root,p)
  fs.readFile(f,(e,d)=>{ if(e){res.writeHead(404);res.end('not found');return}
    res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'}); res.end(d) })
}).listen(port,()=>console.log('docs served on http://localhost:'+port))
