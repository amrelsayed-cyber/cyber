const wa=t=>`https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
$('#waTop').href=wa('السلام عليكم يا عمرو، أنا طالب في الدفعة');
$('#waLead').href=wa('السلام عليكم يا عمرو، عندي استفسار');

const services=[
["subjects","book","المواد والمحاضرات","المحاضرات حسب الدكتور، والسكاشن حسب المعيد."],
["groups","users","الجروبات الرسمية","جروبات الدفعة وجروبات كل مادة بدكاترتها ومعيديها."],
["results","chart","نتائج الامتحانات","درجاتك في كل مادة مع تفاصيل الدكتور والمعيد."],
["exams","file","امتحانات الأعوام السابقة","تتوفر قبل الامتحانات بأسبوعين."],
["request","mail","طلب البيانات الجامعية","الإيميل الجامعي أو الكود عن طريق الليدر."],
["leader","chat","التواصل مع الليدر","لأي استفسار أو مشكلة أو اقتراح."]];

/* روابط التحميل: ملف على الموقع (files/...) = تحميل مباشر | رابط مشاركة درايف = بيتحول لتحميل مباشر | أي رابط تاني = بيتفتح */
const dlAttr=l=>{
  if(!l||l==='#')return 'href="#"';
  const m=/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?[^"]*?id=)([\w-]+)/.exec(l);
  if(m)return `href="https://drive.google.com/uc?export=download&id=${m[1]}" target="_blank" rel="noopener"`;
  return /^https?:/.test(l)?`href="${l}" target="_blank" rel="noopener"`:`href="${encodeURI(l)}" download`;
};
const ico=n=>`<svg class="i"><use href="#${n}"/></svg>`;
const empty=(t,s)=>`<div class="panel mid"><b style="color:var(--ink)">${t}</b><p>${s}</p></div>`;

const navItems=[['home','home','الرئيسية'],['subjects','book','المواد'],['groups','users','الجروبات'],['request','mail','البيانات الجامعية']];
$('#nav').innerHTML=navItems.map(n=>`<button data-v="${n[0]}" onclick="go('${n[0]}')">${n[2]}</button>`).join('');
$('#tabbar').innerHTML=navItems.map(n=>`<button data-v="${n[0]}" onclick="go('${n[0]}')">${ico(n[1])}${n[2]}</button>`).join('');
$$('[data-v=home]').forEach(b=>b.classList.add('on'));
/* home */
const todayName=["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"][new Date().getDay()];
let curDay=days.includes(todayName)?todayName:days[0],curSec=0;
try{curSec=+localStorage.getItem('sec')||0}catch(e){}
if(curSec<0||curSec>10)curSec=0;
const norm=e=>e.g?{...e,s:groups[e.g][0],n:groups[e.g][1]-groups[e.g][0]+1}:{...e,n:e.n||1};
const info=x=>`<small>${x.k} • ${x.who}${x.p?' • '+x.p:''}</small>`;
function drawSched(){
  $$('#dayTabs button').forEach(b=>b.classList.toggle('on',b.dataset.d===curDay));
  $('#daySel').value=curDay;
  const es=schedule.filter(x=>x.d===curDay).map(norm),w=$('#week');
  const card=x=>`<div class="ev${x.k==='سكشن'?' sec':''}"><time>الفترة ${ordn[x.per-1]} • ${periods[x.per-1]}</time><b>${x.t}</b>${info(x)}</div>`;
  const mineOf=n=>es.filter(x=>n>=x.s&&n<x.s+x.n).sort((a,b)=>a.per-b.per);
  const gOf=n=>Object.keys(groups).find(k=>n>=groups[k][0]&&n<=groups[k][1]);
  const secs=curSec?[curSec]:Array.from({length:10},(_,i)=>i+1); // سكشن واحد أو الكل
  const occ={};
  if(curSec)mineOf(curSec).forEach(x=>occ[curSec+'-'+x.per]=x);
  else es.forEach(x=>{occ[x.s+'-'+x.per]=x;for(let i=1;i<x.n;i++)occ[(x.s+i)+'-'+x.per]='skip'});
  let h=`<table class="tt${curSec?' one':''}"><thead><tr><th class="g">المجموعة</th><th class="n">السكشن</th>`+periods.map((t,i)=>`<th>الفترة ${ordn[i]}<small>${t}</small></th>`).join('')+'</tr></thead><tbody>';
  secs.forEach(n=>{
    const g=gOf(n),first=curSec||n===groups[g][0];
    h+=`<tr${!curSec&&first&&n>1?' class="gs"':''}>`+(first?`<th class="g" rowspan="${curSec?1:groups[g][1]-groups[g][0]+1}">${g}</th>`:'')+`<th class="n">سكشن ${n}</th>`;
    for(let p=1;p<=5;p++){const x=occ[n+'-'+p];if(x==='skip')continue;h+=x?`<td rowspan="${curSec?1:x.n}"><div class="ev${x.k==='سكشن'?' sec':''}"><b>${x.t}</b>${info(x)}</div></td>`:'<td class="emp"></td>'}
    h+='</tr>';
  });
  let l='';
  (curSec?[gOf(curSec)]:Object.keys(groups)).forEach(k=>{l+=`<div class="mg">${k}</div>`;secs.filter(n=>gOf(n)===k).forEach(n=>{const m=mineOf(n);l+=`<div class="ms"><h5>سكشن ${n}</h5>${m.length?m.map(card).join(''):'<p class="none">لا يوجد</p>'}</div>`})});
  w.className='full';
  w.innerHTML=`<div class="swipe">${ico('arr')}اسحب لليمين لعرض باقي الجدول</div><div class="tw">${h}</tbody></table></div><div class="ml">${l}</div>`;
  swipeHint();
}
function swipeHint(){
  const tw=$('#week .tw'),hn=$('#week .swipe');if(!tw||!hn)return;
  hn.classList.toggle('show',tw.scrollWidth>tw.clientWidth+4);
  tw.onscroll=()=>{if(Math.abs(tw.scrollLeft)>20)hn.classList.remove('show')};
}
addEventListener('resize',swipeHint);
function pickDay(d){curDay=d;drawSched()}
function setSec(v){curSec=+v;try{localStorage.setItem('sec',v)}catch(e){}drawSched()}
$('#dayTabs').innerHTML=days.map(d=>`<button data-d="${d}" class="${d===todayName?'today':''}" onclick="pickDay('${d}')">${d}</button>`).join('');
$('#secSel').innerHTML='<option value="0">كل السكاشن</option>'+Object.keys(groups).map(k=>`<optgroup label="${k}">`+Array.from({length:groups[k][1]-groups[k][0]+1},(_,i)=>`<option value="${groups[k][0]+i}">سكشن ${groups[k][0]+i} — ${k}</option>`).join('')+'</optgroup>').join('');
$('#daySel').innerHTML=days.map(d=>`<option value="${d}">${d}${d===todayName?' (اليوم)':''}</option>`).join('');
$('#secSel').value=curSec;
drawSched();
$('#svcs').innerHTML=services.map(s=>`<button class="svc" onclick="go('${s[0]}')"><span class="ic">${ico(s[1])}</span><div class="tx"><b>${s[2]}</b><span>${s[3]}</span></div></button>`).join('');

/* navigation */
function show(id,sub){
  const d=$('#dlg');if(d&&d.open)d.close();
  $$('.view').forEach(v=>v.classList.toggle('on',v.id===id));
  $$('#nav button,#tabbar button').forEach(b=>b.classList.toggle('on',b.dataset.v===id));
  if(id==='subjects')sub?renderSub(sub):subBack();
  if(id==='groups')grpGrid();
  if(id==='exams')exGrid();
  scrollTo({top:0,behavior:'smooth'});
}
function go(id,sub){
  const st=history.state||{n:0};
  if(st.v===id&&(st.sub||null)===(sub||null)){show(id,sub);return}
  history.pushState({v:id,sub:sub||null,n:st.n+1},'','#'+id+(sub?'/'+sub:''));
  show(id,sub);
}
function back(){const st=history.state;if(st&&st.n>0)history.back();else go('home')}
addEventListener('popstate',e=>{const st=e.state||{v:'home',sub:null};show(st.v,st.sub)});

/* results */
function searchRes(){
  const q=$('#rq').value.trim().toLowerCase(); if(!q)return;
  const s=results.find(x=>x.name.toLowerCase().includes(q)||x.code===q);
  $('#rOut').innerHTML=!s?empty('لم يتم العثور على نتائج','تأكد من كتابة الاسم أو الكود الجامعي بشكل صحيح.'):
  `<div class="stu"><div><small>بيانات الطالب</small><h3>${s.name}</h3><small>الكود الجامعي: ${s.code}</small></div><div style="text-align:center"><small>عدد المواد</small><div class="big" style="color:#7FD6D0">${s.res.length}</div></div></div>`+
  s.res.map(r=>`<div class="panel res"><header><h3>${r.sub}</h3><span class="tag">التقدير: ${r.st}</span></header><div class="bar"><i style="width:${r.tot.split('/')[0]/r.tot.split('/')[1]*100}%"></i></div>
  <div class="nums"><div><small>الشفوي / العملي</small>${r.oral}</div><div><small>الميدتيرم</small>${r.mid}</div><div><small>الفاينال</small>${r.fin}</div><div class="tot"><small>المجموع</small>${r.tot}</div></div>
  <div class="who"><b>الدكتور: ${r.doc.n}</b><div class="kv"><div><small>الميدتيرم</small>${r.doc.mid}</div><div><small>الفاينال</small>${r.doc.fin}</div><div><small>ملاحظات</small>${r.doc.note}</div></div></div>
  <div class="who"><b>المعيد: ${r.ta.n}</b><div class="kv"><div><small>الشفوي/العملي</small>${r.ta.oral}</div><div><small>الكويزات</small>${r.ta.quiz}</div><div><small>الشيتات</small>${r.ta.sheet}</div><div><small>التقييم</small>${r.ta.note}</div></div></div></div>`).join('');
}

/* subjects */
function subBack(){
  $('#subList').classList.remove('hide');$('#subDet').classList.add('hide');
  $('#subGrid').innerHTML=subjects.map(s=>`<button class="card" onclick="openSub('${s.id}')"><span class="tag">${s.code}</span><h3>${s.title}</h3><p>${s.desc}</p><footer><span>${s.doctors.length} دكاترة</span><span>${s.tas.length} معيدين</span></footer></button>`).join('');
}
function pane(tabsEl,listEl,people){
  const draw=i=>{
    $$(tabsEl+' button').forEach((b,j)=>b.classList.toggle('on',i===j));
    $(listEl).innerHTML=people[i].items.map(x=>`<div class="row"><span>${x.t}</span><a class="btn ghost sm" ${dlAttr(x.l)}>تحميل</a></div>`).join('')||'<p style="color:var(--mut);padding:14px 0">لم تُرفع ملفات بعد</p>';
  };
  $(tabsEl).innerHTML=people.map((p,i)=>`<button>${p.name}</button>`).join('');
  $$(tabsEl+' button').forEach((b,i)=>b.onclick=()=>draw(i));
  draw(0);
}
function openSub(id){go('subjects',id)}
function renderSub(id){
  const s=subjects.find(x=>x.id===id);
  $('#sTitle').textContent=s.title;$('#sDesc').textContent=s.desc;
  $('#subList').classList.add('hide');$('#subDet').classList.remove('hide');
  pane('#dTabs','#dList',s.doctors);pane('#tTabs','#tList',s.tas);
  scrollTo({top:0,behavior:'smooth'});
}

/* groups */
function grpGrid(){
  $('#cohortGroups').innerHTML=cohortGroups.map(g=>`<div class="row"><span>${g.name}</span><a class="btn sm" href="${g.url}" target="_blank" rel="noopener">${g.label||'انضمام'}</a></div>`).join('');
  $('#grpGrid').innerHTML=subjects.map(s=>`<button class="card" onclick="openGrp('${s.id}')"><span class="tag">${s.code}</span><h3>${s.title}</h3><p>${s.desc}</p><footer><span>${s.doctors.length} جروبات دكاترة</span><span>${s.tas.length} جروبات معيدين</span></footer></button>`).join('');
}
function openGrp(id){
  const s=subjects.find(x=>x.id===id), l=p=>p.map(x=>`<div class="row"><span>${x.name}</span><a class="btn sm" href="${x.url}" target="_blank" rel="noopener">جروب ${x.type}</a></div>`).join('');
  $('#dCode').textContent=s.code;$('#dTitle').textContent=s.title;$('#dDocs').innerHTML=l(s.doctors);$('#dTas').innerHTML=l(s.tas);
  $('#dlg').showModal();
}

/* exams */
function exGrid(){
  if(!EXAMS_OPEN){$('#exGrid').className='';$('#exGrid').innerHTML=empty('غير متوفرة حاليًا','تتوفر امتحانات الأعوام السابقة قبل الامتحانات بأسبوعين.');return}
  $('#exGrid').className='grid2';
  $('#exGrid').innerHTML=subjects.map(s=>`<div class="panel"><span class="tag">${s.code}</span><h3 style="margin:6px 0 4px">${s.title}</h3>${s.exams.map(e=>`<div class="row"><span>${e.t}</span><a class="btn ghost sm" ${dlAttr(e.l)}>تحميل</a></div>`).join('')||'<p style="color:var(--mut);padding:10px 0">لم تُرفع امتحانات بعد</p>'}</div>`).join('');
}

/* lookup */
function lookup(){
  const q=$('#lq').value.trim().toLowerCase(); if(!q)return;
  const s=students.find(x=>x.name.toLowerCase().includes(q)||x.code===q);
  $('#lOut').innerHTML=!s?empty('لم يتم العثور على الطالب','راجع الاسم أو الكود وحاول مرة أخرى.'):
  `<h3 style="text-align:center;margin-bottom:12px">${s.name}</h3><div class="nums" style="grid-template-columns:1fr 1fr"><div><small>السكشن</small><span class="big">${s.section}</span></div><div><small>المجموعة</small><span class="big">${s.group}</span></div></div>`;
}

/* request via whatsapp */
function sendReq(e){
  e.preventDefault();
  open(wa(`السلام عليكم، أرغب في طلب بياناتي الجامعية:\n- الاسم: ${$('#rn').value}\n- الهاتف: ${$('#rp').value}\n- المطلوب: ${$('#rt').value}\n- ملاحظات: ${$('#rm').value||'-'}`),'_blank');
}

/* back buttons + initial route */
$$('.view').forEach(v=>{if(v.id!=='home')v.insertAdjacentHTML('afterbegin',`<button class="back" onclick="back()">${ico('arr')}رجوع</button>`)});
{const h=location.hash.slice(1).split('/'),e=document.getElementById(h[0]),f=e&&e.classList.contains('view')?h[0]:'home';
history.replaceState({v:f,sub:h[1]||null,n:0},'');show(f,h[1]||null)}
