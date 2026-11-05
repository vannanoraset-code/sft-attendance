import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync('index.html','utf8');for(const m of source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
const fn=source.slice(source.indexOf('let bulkSaving=false;'),source.indexOf("$('#saveAll').addEventListener('click',saveAllData);"));
for(const mode of ['success','failure','invalid']){
 const states=[1,2].map(()=>({dirty:true,classList:{remove(){},add(){}},textContent:''}));
 const cards=states.map((state,i)=>({dataset:{id:String(i+1)},querySelector:()=>state}));let calls=0,payload;const alerts=[];
 const ctx={document:{querySelectorAll:s=>s==='.emp'?cards:[]},$:s=>({value:s==='#workDate'?'2026-10-12':'site'}),employees:[{id:1,name:'A'},{id:2,name:'B'}],records:[],readCardDraft:el=>({employee_id:Number(el.dataset.id),status:mode==='invalid'?'pending':'work',advance_amount:0,start_time:'08:00',morning_out:'12:00',afternoon_in:'13:00',end_time:'17:00'}),workedMinutesRec:()=>480,recFor:()=>({note:'keep'}),sync(){},alert:s=>alerts.push(s),console:{error(){}},api:async(p,o)=>{calls++;payload=JSON.parse(o.body);if(mode==='failure')throw Error('offline');}};
 vm.createContext(ctx);await vm.runInContext(fn+';saveAllData()',ctx);
 assert.equal(calls,mode==='invalid'?0:1);
 if(mode==='success'){assert.equal(payload.length,2);assert.equal(payload[0].work_date,'2026-10-12');assert.equal(payload[0].note,'keep');assert.equal(ctx.records.length,2);assert.match(states[0].textContent,/บันทึกแล้ว/);}
 else assert.equal(ctx.records.length,0);
}
console.log('PASS: syntax, multi-person request, selected date, notes, failure retention, invalid input blocks writes');
