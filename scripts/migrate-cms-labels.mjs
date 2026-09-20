import ts from 'typescript';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const seed=JSON.parse(readFileSync('backend/seed.json','utf8'));
for(const dir of ['src/components/scholars','src/routes'])for(const file of readdirSync(dir).filter(s=>s.endsWith('.tsx'))){
 const path=dir+'/'+file;let source=readFileSync(path,'utf8');
 const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[],fields={};
 for(const fn of ast.statements){
  if(!ts.isFunctionDeclaration(fn)||!fn.body||!fn.name||!/^[A-Z]/.test(fn.name.text))continue;
  let changed=false;
  const replace=(n,attribute=false)=>{
   const key=file.replace('.tsx','')+'.label.'+createHash('sha256').update(n.text).digest('hex').slice(0,12);
   fields[key]=n.text;const expression='cmsLabel('+JSON.stringify(key)+','+JSON.stringify(n.text)+')';
   edits.push({start:n.getStart(ast),end:n.end,text:attribute?'{'+expression+'}':expression});changed=true;
  };
  const visit=n=>{
   if(ts.isJsxAttribute(n)&&['label','title','sub','intro','placeholder','alt','aria-label'].includes(n.name.text)&&n.initializer&&ts.isStringLiteral(n.initializer)){replace(n.initializer,true);return;}
   if(ts.isPropertyAssignment(n)&&['label','title','desc'].includes(n.name.getText(ast))&&ts.isStringLiteral(n.initializer)){replace(n.initializer);return;}
   ts.forEachChild(n,visit);
  };visit(fn.body);
  if(changed)edits.push({start:fn.body.getStart(ast)+1,end:fn.body.getStart(ast)+1,text:'\n const cmsLabel = useCmsLookup();\n'});
 }
 if(edits.length){for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);writeFileSync(path,'import {useCmsLookup} from "@/lib/cms";\n'+source);seed.push({id:'copy-labels-'+file.replace('.tsx',''),kind:'copy',title:file.replace('.tsx','')+' labels',data:fields});}
}
seed.push({id:'copy-navigation',kind:'copy',title:'Navigation and hero headline',data:{'local.NAV.0.label':'Home','local.NAV.1.label':'Programs','local.NAV.2.label':'Destinations','local.NAV.3.label':'Services','local.NAV.4.label':'Resources','local.NAV.5.label':'About','local.NAV.6.label':'Contact','local.headline.0':'Where','local.headline.1':'ambition','local.headline.2':'meets'}});
writeFileSync('backend/seed.json',JSON.stringify(seed,null,2)+'\n');
