const express=require("express"),fs=require("fs"),path=require("path"),app=express(),PORT=process.env.PORT||3000;

function buildIfNeeded(){
  try{
    const indexPath=path.join(__dirname,"index.html");
    const builtPath=path.join(__dirname,"index.built.html");
    if(!fs.existsSync(builtPath)||fs.statSync(indexPath).mtime>fs.statSync(builtPath).mtime){
      console.log("Building JSX...");
      require("./build.js");
    }
  }catch(e){console.log("Build skipped:",e.message);}
}
buildIfNeeded();

app.use(express.json({limit:"10mb"}));
app.use(express.static(__dirname));
if(!fs.existsSync(path.join(__dirname,"data")))fs.mkdirSync(path.join(__dirname,"data"));
const F=path.join(__dirname,"data","kc_data.json");
const DEF={users:[{id:"boss",name:"Boss KC",role:"boss",pin:"0000",dept:null,canManage:true,canViewAll:true,canScore:true,avatar:null}],employees:[],vehicles:[],logoUrl:null,bonusConfig:null,feedbacks:[],attendance:{},gameLogs:[],appointments:[],revenueData:{}};
if(!fs.existsSync(F))fs.writeFileSync(F,JSON.stringify(DEF),"utf8");
const R=()=>JSON.parse(fs.readFileSync(F,"utf8"));
const W=(d)=>fs.writeFileSync(F,JSON.stringify(d,null,2),"utf8");
app.get("/api/data",(q,r)=>{try{r.json(R())}catch(e){r.json(DEF)}});
app.post("/api/users",(q,r)=>{try{const d=R();d.users=q.body;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});
app.post("/api/employees",(q,r)=>{try{const d=R();d.employees=q.body;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});
app.post("/api/vehicles",(q,r)=>{try{const d=R();d.vehicles=q.body;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});
app.post("/api/logo",(q,r)=>{try{const d=R();d.logoUrl=q.body.logoUrl;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});
app.post("/api/bonusConfig",(q,r)=>{try{const d=R();d.bonusConfig=q.body;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});
app.post("/api/feedbacks",(q,r)=>{try{const d=R();d.feedbacks=q.body;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});
app.post("/api/attendance",(q,r)=>{try{const d=R();d.attendance=q.body;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});
app.post("/api/gameLogs",(q,r)=>{try{const d=R();d.gameLogs=q.body;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});
app.post("/api/appointments",(q,r)=>{try{const d=R();d.appointments=q.body;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});
app.post("/api/revenueData",(q,r)=>{try{const d=R();d.revenueData=q.body;W(d);r.json({ok:true})}catch(e){r.status(500).json({error:e.message})}});

// 🔧 EMERGENCY FIX: Clear corrupted MBTI data
app.get("/api/fix-mbti",(q,r)=>{try{const d=R();let fixed=0;if(d.employees){d.employees=d.employees.map(e=>{if(e.mbti||e.mbtiResult||e.mbtiAnswers||e.mbtiData){delete e.mbti;delete e.mbtiResult;delete e.mbtiAnswers;delete e.mbtiData;fixed++;}return e;});}if(d.users){d.users=d.users.map(u=>{if(u.mbti||u.mbtiResult||u.mbtiAnswers||u.mbtiData){delete u.mbti;delete u.mbtiResult;delete u.mbtiAnswers;delete u.mbtiData;fixed++;}return u;});}W(d);r.json({ok:true,fixed,msg:`Cleared MBTI data from ${fixed} records`});}catch(e){r.status(500).json({error:e.message})}});

app.post("/api/ai",(q,r)=>{
  const https=require("https");
  const apiKey=process.env.ANTHROPIC_API_KEY||"";
  if(!apiKey){return r.status(500).json({error:"ANTHROPIC_API_KEY not set"});}
  const body=JSON.stringify(q.body);
  const options={hostname:"api.anthropic.com",path:"/v1/messages",method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","Content-Length":Buffer.byteLength(body)}};
  const req=https.request(options,res=>{
    let data="";
    res.on("data",chunk=>data+=chunk);
    res.on("end",()=>{try{const p=JSON.parse(data);if(p.error)return r.status(400).json({error:p.error.message||JSON.stringify(p.error)});r.json(p);}catch(e){r.status(500).json({error:"Parse error"});}});
  });
  req.on("error",e=>r.status(500).json({error:e.message}));
  req.write(body);req.end();
});
app.get("*",(q,r)=>{
  const built=path.join(__dirname,"index.built.html");
  const fallback=path.join(__dirname,"index.html");
  r.sendFile(fs.existsSync(built)?built:fallback);
});
app.listen(PORT,()=>console.log("KC KPI on port "+PORT));
