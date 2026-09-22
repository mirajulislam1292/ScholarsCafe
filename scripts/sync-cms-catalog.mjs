// Keep editable labels and the admin field catalog synchronized without changing saved content.
import ts from 'typescript';
import { build } from 'esbuild';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';
const catalog = JSON.parse(readFileSync('public/cms-copy-catalog.json','utf8'));
for (const dir of ['src/components/scholars','src/routes']) for (const file of readdirSync(dir).filter(f=>f.endsWith('.tsx')&&f!=='__root.tsx')) {
  const path=dir+'/'+file; let source=readFileSync(path,'utf8');
  const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX), edits=[];
  for(const fn of ast.statements) {
    if(!ts.isFunctionDeclaration(fn)||!fn.body||!fn.name||!/^[A-Z]/.test(fn.name.text)) continue;
    let changed=false;
    const visit=n=>{
      if(ts.isJsxElement(n)&&n.openingElement.tagName.getText(ast)==='CmsText') {
        const id=n.openingElement.attributes.properties.find(a=>a.name?.text==='id')?.initializer?.text;
        if(id) { const text=n.children.filter(ts.isJsxText).map(x=>x.text).join('').replace(/\s+/g,' ').trim(); if(text) catalog[id]=text; }
        return;
      }
      if(ts.isJsxAttribute(n)&&['label','title','sub','intro','placeholder','alt','aria-label'].includes(n.name.text)&&n.initializer&&ts.isStringLiteral(n.initializer)) {
        const value=n.initializer.text,key=file.replace('.tsx','')+'.label.'+createHash('sha256').update(value).digest('hex').slice(0,12);
        catalog[key]=value; edits.push({start:n.initializer.getStart(ast),end:n.initializer.end,text:'{cmsLabel('+JSON.stringify(key)+','+JSON.stringify(value)+')}'});changed=true;return;
      }
      if(ts.isCallExpression(n)&&n.expression.getText(ast)==='cmsLabel'&&n.arguments.length===2&&ts.isStringLiteral(n.arguments[0])&&ts.isStringLiteral(n.arguments[1])) catalog[n.arguments[0].text]=n.arguments[1].text;
      ts.forEachChild(n,visit);
    };visit(fn.body);
    if(changed&&!fn.body.getText(ast).includes('const cmsLabel')) edits.push({start:fn.body.getStart(ast)+1,end:fn.body.getStart(ast)+1,text:'\n const cmsLabel = useCmsLookup();\n'});
  }
  if(edits.length) {
    for(const e of edits.sort((a,b)=>b.start-a.start)) source=source.slice(0,e.start)+e.text+source.slice(e.end);
    if(!source.includes('import {useCmsLookup}')&&!source.includes('import { useCmsLookup }')) source='import {useCmsLookup} from "@/lib/cms";\n'+source;
    writeFileSync(path,source);
  }
}
function collect(v,path) {
  if(typeof v==='string'||typeof v==='number')catalog[path]=String(v);
  else if(Array.isArray(v))v.forEach((x,i)=>collect(x,path+'.'+i));
  else if(v&&typeof v==='object')for(const [k,x]of Object.entries(v)) collect(x,path+'.'+k);
}
const assets=readdirSync('dist/client/assets');
for(const [entry,prefix] of [['scholars-data','data'],['university-acceptances','universities'],['destinations-data','destinations']]) {
  const result=await build({entryPoints:['src/lib/'+entry+'.ts'],bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'catalog-images',setup(b){b.onResolve({filter:/\.jpg$/},a=>({path:a.path,namespace:'image'}));b.onLoad({filter:/.*/,namespace:'image'},a=>{const stem=basename(a.path,'.jpg');const file=assets.find(f=>f.startsWith(stem+'-')&&f.endsWith('.jpg'));if(!file)throw Error('Build first: '+stem);return {contents:'export default '+JSON.stringify('/assets/'+file),loader:'js'};});}}]});
  const data=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
  if(entry==='scholars-data')for(const [key,value]of Object.entries(data)) {if(!['PROGRAMS','TEAM','TESTIMONIALS','TESTS'].includes(key))collect(value,prefix+'.'+key);}
  else collect(data[entry==='university-acceptances'?'UNIVERSITY_ACCEPTANCES':'DESTINATIONS'],prefix);
}
Object.assign(catalog,{'brand.image':'/brand-mark.png','local.headline.0':'Where','local.headline.1':'ambition','local.headline.2':'meets'});
['Home','Programs','Destinations','Services','Resources','About','Contact'].forEach((label,i)=>catalog['local.NAV.'+i+'.label']=label);
writeFileSync('public/cms-copy-catalog.json',JSON.stringify(catalog,null,2)+'\n');
writeFileSync('backend/public/cms-copy-catalog.json',JSON.stringify(catalog,null,2)+'\n');
console.log('Catalog fields:',Object.keys(catalog).length);
