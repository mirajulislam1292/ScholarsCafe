import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
import {build} from 'esbuild';
const sourcePath='src/lib/scholars-data.ts';
let source=readFileSync(sourcePath,'utf8');
source=source.replace(/export const TESTS = \[[\s\S]*?\n\];/,'export const TESTS = [];');
source=source.replace('Test prep, extracurricular shaping, and academic positioning.','Extracurricular shaping and academic positioning.');
source=source.replace(/^.*role: "Test Prep Lead".*\n/m,'');
source=source.replace(/^.*id: "Test Prep".*\n/m,'');
source=source.replace(/  \{\n    tag: "Test Prep",[\s\S]*?\n  \},\n/g,'');
writeFileSync(sourcePath,source);
const replaceCopy=s=>s.replaceAll('from their first SAT session to their visa approval day','from their first consultation to their visa approval day').replaceAll('scholarship strategy, and test prep','scholarship strategy, and visa guidance').replaceAll('admissions consultancy, test prep, and related services','admissions consultancy and related services').replaceAll('for a consultation, test prep, or any of our admissions programs','for a consultation or any of our admissions programs').replaceAll('strategy, standardized test preparation (SAT, IELTS, TOEFL, DET),','strategy,');
for(const directory of ['src/components/scholars','src/routes'])for(const file of readdirSync(directory).filter(n=>n.endsWith('.tsx'))){const path=directory+'/'+file;writeFileSync(path,replaceCopy(readFileSync(path,'utf8')));}
const seed=JSON.parse(replaceCopy(readFileSync('backend/seed.json','utf8')));
await build({entryPoints:[sourcePath],outfile:'.cms-data.mjs',platform:'node',format:'esm',bundle:true});
const data=await import('../.cms-data.mjs?updated');
function collect(value,path,out){if(typeof value==='string')out[path]=value;else if(Array.isArray(value))value.forEach((v,i)=>collect(v,path+'.'+i,out));else if(value&&typeof value==='object')for(const [k,v]of Object.entries(value))collect(v,path+'.'+k,out);}
const managed=new Set(['TEAM','PROGRAMS','TESTIMONIALS','TESTS']);
const fields={};for(const [key,value]of Object.entries(data))if(!managed.has(key))collect(value,'data.'+key,fields);
seed.push({id:'copy-data',kind:'copy',title:'Services, FAQs, destinations, contact details and resources',data:fields});
for(const directory of ['src/components/scholars','src/routes'])for(const file of readdirSync(directory).filter(n=>n.endsWith('.tsx'))){
 const path=directory+'/'+file;let content=readFileSync(path,'utf8');
 const ast=ts.createSourceFile(path,content,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const edits=[],bindings=[];
 for(const n of ast.statements){
  if(ts.isImportDeclaration(n)&&n.moduleSpecifier.text==='@/lib/scholars-data'){
   for(const spec of n.importClause?.namedBindings?.elements||[]){
    const original=(spec.propertyName||spec.name).text;
    if(spec.isTypeOnly||managed.has(original)||!(original in data))continue;
    const local=spec.name.text;const alias='CMS_DEFAULT_'+local;
    edits.push({start:spec.getStart(ast),end:spec.end,text:original+' as '+alias});bindings.push({local,alias,original});
   }
  }
 }
 if(!bindings.length)continue;
 for(const n of ast.statements)if(ts.isFunctionDeclaration(n)&&n.body&&n.name&&/^[A-Z]/.test(n.name.text)){
  edits.push({start:n.body.getStart(ast)+1,end:n.body.getStart(ast)+1,text:'\n'+bindings.map(b=>'  const '+b.local+' = useCmsValue("data.'+b.original+'", '+b.alias+');').join('\n')+'\n'});
 }
 for(const e of edits.sort((a,b)=>b.start-a.start))content=content.slice(0,e.start)+e.text+content.slice(e.end);
 content='import { useCmsValue } from "@/lib/cms";\n'+content+'\n'+bindings.map(b=>'const '+b.local+' = '+b.alias+';').join('\n')+'\n';
 writeFileSync(path,content);
}
writeFileSync('backend/seed.json',JSON.stringify(seed,null,2)+'\n');
const ui='backend/public/app.js';writeFileSync(ui,readFileSync(ui,'utf8').replace("['Access','Activity']","['Access','Messages','Activity']"));
