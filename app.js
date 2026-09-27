document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('is-open', !expanded);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

// Sticky header scroll elevation and compacting
const siteHeader = document.querySelector('.site-header');
function updateHeader() {
  if (siteHeader) {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 30);
  }
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// A personal portrait with a keyboard-accessible off-duty reveal.
const portrait = document.querySelector('.portrait-stage');
const offDuty = document.getElementById('off-duty');
const offDutyButton = document.querySelector('.sticker-human');
const offDutyClose = document.querySelector('.off-duty-close');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let offDutyClosing = false;

function setOffDuty(open) {
  if (open) {
    offDuty.classList.remove('is-closing');
    offDuty.hidden = false;
    offDutyButton.setAttribute('aria-expanded', 'true');
    if (offDutyClose) offDutyClose.focus();
  } else {
    if (reducedMotion.matches) {
      offDuty.hidden = true;
      offDuty.classList.remove('is-closing');
      offDutyButton.setAttribute('aria-expanded', 'false');
      offDutyButton.focus();
      return;
    }
    if (offDutyClosing || offDuty.hidden) return;
    offDutyClosing = true;
    offDuty.classList.add('is-closing');
    let finished = false;
    const onEnd = () => {
      if (finished) return;
      finished = true;
      clearTimeout(safetyTimer);
      offDuty.removeEventListener('animationend', onEnd);
      offDuty.classList.remove('is-closing');
      offDuty.hidden = true;
      offDutyClosing = false;
      offDutyButton.setAttribute('aria-expanded', 'false');
      offDutyButton.focus();
    };
    const safetyTimer = setTimeout(onEnd, 500);
    offDuty.addEventListener('animationend', onEnd, { once: true });
  }
}
offDutyButton.addEventListener('click', () => setOffDuty(true));
offDutyClose.addEventListener('click', () => setOffDuty(false));
offDuty.addEventListener('keydown', e => {
  if (e.key === 'Escape') setOffDuty(false);
});
portrait.addEventListener('pointermove', e => {
  if (reducedMotion.matches || e.pointerType !== 'mouse') return;
  const r = portrait.getBoundingClientRect();
  portrait.style.setProperty('--px', `${((e.clientX-r.left)/r.width-.5)*7}deg`);
  portrait.style.setProperty('--py', `${((e.clientY-r.top)/r.height-.5)*-5}deg`);
});
portrait.addEventListener('pointerleave', () => {
  portrait.style.setProperty('--px','0deg');
  portrait.style.setProperty('--py','0deg');
});

// Open a compact content row when it is the target of an internal link.
function revealLinkedContent() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = document.getElementById(id);
  if (!target) return;
  if (target.matches('details')) target.open = true;
  for (let parent = target.parentElement; parent; parent = parent.parentElement) {
    if (parent.matches('details')) parent.open = true;
  }
}
addEventListener('hashchange', revealLinkedContent);
revealLinkedContent();

// LottieFiles motion-design: object leads, four branches react, copy settles.
// Three distinct materials share one reversible native-scroll timeline.
const story=document.querySelector('.brain-story');
const stage=story.querySelector('.motion-stage');
const panels=[...story.querySelectorAll('.story-panel')];
const chapterDots=[...story.querySelectorAll('.story-dots a')];
const motionControl=story.querySelector('.story-motion');
const chip=story.querySelector('.brain-chip-anchor');
const algae=story.querySelector('.algae-object');
const chocolate=story.querySelector('.chocolate-object');
const wires=[...story.querySelectorAll('.story-wire')];
const svg=story.querySelector('.story-circuits');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>t*t*(3-2*t);
const beat=(p,a,b)=>ease(clamp((p-a)/(b-a)));
const enter=(p,a,b)=>1-Math.pow(1-clamp((p-a)/(b-a)),3);
const leave=(p,a,b)=>Math.pow(clamp((p-a)/(b-a)),3);
const set=(k,v)=>story.style.setProperty(k,String(v));
let motionPaused=false,frame=0,previousTime=0,progress=0,target=0;
let storyStart=0,travel=1,mobile=false,chapter=-1,layoutKey='';
const ranges=[[.13,.415],[.435,.71],[.735,1.035]];
function routeBranches(){
 const w=stage.clientWidth,h=stage.clientHeight;
 const key=`${w}:${h}`;
 if(key===layoutKey)return;
 layoutKey=key;
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
 const cx=w/2,cy=h*(mobile?(h<=740?.31:.34):.5);
 [...panels[1].querySelectorAll('.company-feature')].forEach((card,i)=>{
  const left=i%2===0,bottom=i>1,side=left?-1:1;
  const y=card.offsetTop+(mobile?20:34);
  let d;
  if(mobile){
   const x=left?card.offsetLeft-6:card.offsetLeft+card.offsetWidth+6;
   const lane=left?(bottom?8:16):w-(bottom?8:16);
   d=`M${cx+side*40} ${cy+(bottom?35:0)} L${lane} ${cy+(bottom?90:60)} V${y} H${x}`;
  }else{
   const x=left?card.offsetLeft+card.offsetWidth+12:card.offsetLeft-12;
   d=`M${cx+side*58} ${cy+(bottom?34:-34)} L${cx+side*130} ${y} H${x}`;
  }
  wires[i].setAttribute('d',d);
 });
}
function measureScene(){
 const box=story.getBoundingClientRect();
 storyStart=scrollY+box.top;travel=Math.max(1,box.height-stage.offsetHeight);mobile=innerWidth<=760;
 target=clamp((scrollY-storyStart)/travel);routeBranches();requestFrame();
}
function requestFrame(){if(!frame)frame=requestAnimationFrame(paintScene);}
function expose(panel,alpha){panel.style.opacity=String(alpha);panel.style.visibility=alpha>.001?'visible':'hidden';panel.inert=alpha<.45;panel.setAttribute('aria-hidden',String(alpha<.45));}
function object(el,alpha,y=0){el.style.opacity=String(alpha);el.style.visibility=alpha>.001?'visible':'hidden';el.style.setProperty('--object-shift',`${y}px`);}
function paintScene(time){
 frame=0;const dt=previousTime?Math.min(40,time-previousTime):16;previousTime=time;
 const still=motionPaused||reducedMotion.matches;
 progress+=(target-progress)*(still?1:1-Math.exp(-dt/75));
 const p=progress,active=p<.13?0:p<.425?1:p<.725?2:3;
 if(active!==chapter){chapter=active;story.dataset.company=['intro','arm','airbuild','pladis'][active];set('--chapter-color',['#9d844b','#9d844b','#718a40','#986b4c'][active]);chapterDots.forEach((a,i)=>i===active?a.setAttribute('aria-current','step'):a.removeAttribute('aria-current'));}
 const introAlpha=still?(active===0?1:0):1-leave(p,.06,.13);
 expose(panels[0],introAlpha);
 panels[0].style.transform=still?'none':`translateY(${-20*(1-introAlpha)}px)`;
 const chipAlpha=still?(active<=1?1:0):1-leave(p,.385,.425);
 const algaeAlpha=still?(active===2?1:0):enter(p,.422,.46)*(1-leave(p,.684,.73));
 const chocAlpha=still?(active===3?1:0):enter(p,.724,.766);
 object(chip,chipAlpha,still?0:-24*(1-chipAlpha));
 object(algae,algaeAlpha,still?0:24*(1-algaeAlpha));
 object(chocolate,chocAlpha,still?0:24*(1-chocAlpha));
 const lift=beat(p,.13,.22)*(1-beat(p,.365,.414));
 set('--chip-pitch',`${still?28:30+25*beat(p,.10,.20)-15*beat(p,.365,.414)}deg`);
 set('--chip-turn',`${still?-12:-16-10*beat(p,.10,.20)+14*beat(p,.365,.414)}deg`);
 set('--lift',still?0:lift*(mobile?.65:1));set('--interposer',still?0:lift);
 set('--shadow-scale',1+.2*lift);set('--shadow-alpha',.18-.06*lift);
 set('--grid-drift',`${still||mobile?0:-8*Math.sin(p*Math.PI)}px`);set('--halo-alpha',.2+.3*lift);
 set('--algae-turn',`${still?0:-9+15*beat(p,.44,.64)}deg`);set('--algae-scale',still?1:.96+.08*beat(p,.44,.60));set('--orbit-alpha',algaeAlpha*.7);
 set('--chocolate-turn',`${still?-12:-20+15*beat(p,.74,.88)}deg`);set('--chocolate-open',still?0:beat(p,.76,.84));
 const wireValues=[0,0,0,0];
 ranges.forEach(([start,end],i)=>{
  const local=(p-start)/(end-start);
  const out=i===2?0:leave(local,.86,1);
  const panelAlpha=still?(active===i+1?1:0):enter(local,0,.12)*(1-out);
  const panel=panels[i+1];expose(panel,panelAlpha);
  const heading=panel.querySelector('.company-heading');
  heading.style.transform=still?'none':`translateY(${12*(1-panelAlpha)}px)`;
  [...panel.querySelectorAll('.company-feature')].forEach((card,j)=>{
   const wire=still?(active===i+1?1:0):beat(local,.13+j*.07,.21+j*.07)*(1-out);
   const opacity=still?(active===i+1?1:0):enter(local,.20+j*.07,.30+j*.07)*(1-out);
   card.style.opacity=String(opacity);card.style.transform=still?'none':`translateY(${14*(1-opacity)-out*22}px)`;
   wireValues[j]=Math.max(wireValues[j],wire);
  });
 });
 wireValues.forEach((v,i)=>set(`--wire-${['one','two','three','four'][i]}`,v));
 set('--scene-progress',p);
 updateActiveNav();
 if(Math.abs(target-progress)>.0001)requestFrame();else previousTime=0;
}
const navLinks = {
  work: document.querySelector('.site-header nav a[href="#work"]'),
  build: document.querySelector('.site-header nav a[href="#chapter-arm"]'),
  human: document.querySelector('.site-header nav a[href="#human"]')
};
const workSection = document.getElementById('work');
const humanSection = document.getElementById('human');
let activeNavKey = null;

function updateActiveNav() {
  const headerH = siteHeader ? siteHeader.offsetHeight : 60;
  const threshold = headerH + 60;
  let current = null;
  const isNearBottom = window.innerHeight + window.scrollY >= (document.documentElement.scrollHeight - 50);

  if (isNearBottom || (humanSection && humanSection.getBoundingClientRect().top <= threshold)) {
    current = 'human';
  } else if (workSection && workSection.getBoundingClientRect().top <= threshold) {
    current = 'work';
  } else if (story && (target >= 0.10 || (window.scrollY >= storyStart + travel * 0.10))) {
    current = 'build';
  }

  if (current !== activeNavKey) {
    activeNavKey = current;
    for (const [key, link] of Object.entries(navLinks)) {
      if (!link) continue;
      const isActive = key === current;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }
}

let measureFrame=0;
function scheduleMeasure(){if(!measureFrame)measureFrame=requestAnimationFrame(()=>{measureFrame=0;measureScene();});}
addEventListener('scroll',scheduleMeasure,{passive:true});
addEventListener('scroll',updateActiveNav,{passive:true});
addEventListener('resize',scheduleMeasure,{passive:true});
addEventListener('pageshow',scheduleMeasure);
reducedMotion.addEventListener('change',scheduleMeasure);
const chapterPositions={'#top':0,'#intro':0,'#chapter-arm':.32,'#chapter-airbuild':.625,'#chapter-pladis':.96};
function navigateChapter(hash,behavior='smooth'){measureScene();window.scrollTo({top:hash==='#top'?0:storyStart+chapterPositions[hash]*travel,behavior:reducedMotion.matches?'instant':behavior});}
document.addEventListener('click',event=>{const link=event.target.closest('a'),hash=link?.getAttribute('href');if(!(hash in chapterPositions)||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();history.pushState(null,'',hash);navigateChapter(hash);});
addEventListener('popstate',()=>{if(location.hash in chapterPositions)navigateChapter(location.hash,'instant');});
motionControl.addEventListener('click',()=>{motionPaused=!motionPaused;story.classList.toggle('is-paused',motionPaused);motionControl.setAttribute('aria-pressed',String(motionPaused));motionControl.textContent=motionPaused?'Resume motion ▷':'Pause motion Ⅱ';requestFrame();});
measureScene();
updateActiveNav();
if(location.hash in chapterPositions)requestAnimationFrame(()=>navigateChapter(location.hash,'instant'));
