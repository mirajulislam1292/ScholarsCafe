// One-time mechanical migration: preserve existing JSX wording as editable text keys.
import ts from 'typescript';
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const catalog={};
const directories=['src/components/scholars','src/routes'];
for(const directory of directories)for(const name of readdirSync(directory).filter(n=>n.endsWith('.tsx'))){
 const path=directory+'/'+name;
 if(name==='__root.tsx'||name==='blog.tsx')continue;
 const source=readFileSync(path,'utf8');
 if(source.includes('import { CmsText }'))continue;
 const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const changes=[],fields={};
 function visit(n){
  if(ts.isJsxText(n)&&n.text.trim()){
   const value=n.text.replace(/\s+/g,' ').trim();
   const key=name.replace('.tsx','')+'.'+createHash('sha256').update(value).digest('hex').slice(0,12);
   fields[key]=value;
   changes.push({start:n.pos,end:n.end,text:'<CmsText id="'+key+'">'+n.text+'</CmsText>'});
  }else ts.forEachChild(n,visit);
 }
 visit(ast);
 if(changes.length){let result=source;for(const change of changes.sort((a,b)=>b.start-a.start))result=result.slice(0,change.start)+change.text+result.slice(change.end);writeFileSync(path,'import { CmsText } from "@/lib/cms";\n'+result);catalog[name.replace('.tsx','')]=fields;}
}
await build({entryPoints:['src/lib/scholars-data.ts'],outfile:'.cms-data.mjs',platform:'node',format:'esm',bundle:true});
const data=await import('../.cms-data.mjs');
const seed=[];
for(const [group,fields] of Object.entries(catalog))seed.push({id:'copy-'+group,kind:'copy',title:group+' text',data:fields});
for(const [i,m] of data.TEAM.entries())if(!/test prep/i.test(m.role))seed.push({id:'mentor-'+i,kind:'mentors',title:m.name,data:{...m,photo:''}});
for(const [i,c] of data.PROGRAMS.entries()){const {title,description,price,badge,features,cta,featured}=c;seed.push({id:'course-'+i,kind:'courses',title,data:{title,description,price,badge,features,cta,featured}});}
// Existing testimonials and blog teasers stay drafts until an owner verifies and publishes them.
for(const [i,f] of data.TESTIMONIALS.entries())if(!/IELTS|SAT|TOEFL|test prep/i.test(f.quote)){const {name,quote,destination,outcome,year,initials}=f;seed.push({id:'feedback-'+i,kind:'feedback',title:name,data:{name,quote,destination,outcome,year:String(year),initials},draftOnly:true});}
const output='backend/seed.json';
if(existsSync(output))throw Error('Seed already exists; refusing to replace it.');
writeFileSync(output,JSON.stringify(seed,null,2)+'\n');
